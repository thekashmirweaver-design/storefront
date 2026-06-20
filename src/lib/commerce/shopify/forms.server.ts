import "server-only";

import { brandText } from "../brand/text";
import type { ContactFormInput } from "../types";
import { getShopifyAdminConfig, shopifyAdminRequest } from "./admin";
import { getShopifyBrand } from "./brand";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NEWSLETTER_TAG = "newsletter";
const CONTACT_TAG = "contact-form";

type AdminUserError = { field?: string[] | null; message: string };

type CustomerNode = {
  id: string;
  email?: string | null;
  note?: string | null;
  tags?: string[];
};

function formatUserErrors(errors: AdminUserError[]): string {
  return errors.map((error) => error.message).join("; ");
}

function splitName(fullName: string): { firstName: string; lastName?: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "Website visitor" };
  if (parts.length === 1) return { firstName: parts[0]! };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

function marketingConsentInput() {
  return {
    marketingState: "SUBSCRIBED" as const,
    marketingOptInLevel: "SINGLE_OPT_IN" as const,
    consentUpdatedAt: new Date().toISOString(),
  };
}

function formatContactNote(form: ContactFormInput): string {
  const subject = form.subject?.trim() || "(no subject)";
  const timestamp = new Date().toISOString();

  return [
    `[Website contact — ${timestamp}]`,
    `Name: ${form.name.trim()}`,
    `Email: ${form.email.trim()}`,
    `Subject: ${subject}`,
    "",
    form.message.trim(),
  ].join("\n");
}

async function findCustomerByEmail(email: string): Promise<CustomerNode | null> {
  const data = await shopifyAdminRequest<{
    customers?: { nodes?: CustomerNode[] };
  }>(
    `
      query CustomerByEmail($query: String!) {
        customers(first: 1, query: $query) {
          nodes {
            id
            email
            note
            tags
          }
        }
      }
    `,
    { query: `email:${email}` },
  );

  return data.customers?.nodes?.[0] ?? null;
}

async function subscribeExistingCustomer(customerId: string): Promise<void> {
  const data = await shopifyAdminRequest<{
    customerEmailMarketingConsentUpdate?: {
      userErrors: AdminUserError[];
    };
  }>(
    `
      mutation CustomerEmailMarketingConsentUpdate(
        $input: CustomerEmailMarketingConsentUpdateInput!
      ) {
        customerEmailMarketingConsentUpdate(input: $input) {
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      input: {
        customerId,
        emailMarketingConsent: marketingConsentInput(),
      },
    },
  );

  const errors = data.customerEmailMarketingConsentUpdate?.userErrors ?? [];
  if (errors.length) {
    throw new Error(formatUserErrors(errors));
  }
}

async function createNewsletterCustomer(email: string): Promise<void> {
  const data = await shopifyAdminRequest<{
    customerCreate?: {
      userErrors: AdminUserError[];
    };
  }>(
    `
      mutation CustomerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      input: {
        email,
        tags: [NEWSLETTER_TAG],
        emailMarketingConsent: marketingConsentInput(),
      },
    },
  );

  const errors = data.customerCreate?.userErrors ?? [];
  if (errors.length) {
    throw new Error(formatUserErrors(errors));
  }
}

async function addCustomerTags(customerId: string, tags: string[]): Promise<void> {
  const data = await shopifyAdminRequest<{
    tagsAdd?: {
      userErrors: AdminUserError[];
    };
  }>(
    `
      mutation TagsAdd($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          userErrors {
            field
            message
          }
        }
      }
    `,
    { id: customerId, tags },
  );

  const errors = data.tagsAdd?.userErrors ?? [];
  if (errors.length) {
    throw new Error(formatUserErrors(errors));
  }
}

async function upsertContactCustomer(form: ContactFormInput): Promise<void> {
  const email = form.email.trim();
  const { firstName, lastName } = splitName(form.name);
  const noteEntry = formatContactNote(form);
  const existing = await findCustomerByEmail(email);

  if (existing) {
    const note = existing.note?.trim()
      ? `${existing.note.trim()}\n\n---\n\n${noteEntry}`
      : noteEntry;

    const data = await shopifyAdminRequest<{
      customerUpdate?: {
        userErrors: AdminUserError[];
      };
    }>(
      `
        mutation CustomerUpdate($input: CustomerInput!) {
          customerUpdate(input: $input) {
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        input: {
          id: existing.id,
          firstName,
          lastName,
          note,
        },
      },
    );

    const errors = data.customerUpdate?.userErrors ?? [];
    if (errors.length) {
      throw new Error(formatUserErrors(errors));
    }

    if (!existing.tags?.includes(CONTACT_TAG)) {
      await addCustomerTags(existing.id, [CONTACT_TAG]);
    }

    return;
  }

  const data = await shopifyAdminRequest<{
    customerCreate?: {
      userErrors: AdminUserError[];
    };
  }>(
    `
      mutation CustomerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      input: {
        email,
        firstName,
        lastName,
        note: noteEntry,
        tags: [CONTACT_TAG],
      },
    },
  );

  const errors = data.customerCreate?.userErrors ?? [];
  if (errors.length) {
    throw new Error(formatUserErrors(errors));
  }
}

function formsUnavailableMessage(): string {
  return "We couldn't process your request right now. Please try again later.";
}

export async function subscribeShopifyNewsletter(
  email: string,
): Promise<{ ok: boolean; message: string }> {
  const trimmed = email.trim();
  if (!EMAIL_PATTERN.test(trimmed)) {
    return { ok: false, message: "Please enter a valid email" };
  }

  if (!getShopifyAdminConfig()) {
    console.error(
      "[shopify/forms] Admin API not configured — set SHOPIFY_ADMIN_ACCESS_TOKEN or SHOPIFY_PARTNER_APP_DIR",
    );
    return { ok: false, message: formsUnavailableMessage() };
  }

  try {
    const existing = await findCustomerByEmail(trimmed);

    if (existing) {
      await subscribeExistingCustomer(existing.id);
      if (!existing.tags?.includes(NEWSLETTER_TAG)) {
        await addCustomerTags(existing.id, [NEWSLETTER_TAG]);
      }
    } else {
      await createNewsletterCustomer(trimmed);
    }

    const brand = await getShopifyBrand();
    return {
      ok: true,
      message: brandText(brand.copy.messages.newsletterWelcome, brand),
    };
  } catch (error) {
    console.error("[shopify/forms] Newsletter signup failed:", error);
    return { ok: false, message: formsUnavailableMessage() };
  }
}

export async function submitShopifyContact(
  form: ContactFormInput,
): Promise<{ ok: boolean; message: string }> {
  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
    return { ok: false, message: "Please fill in all required fields" };
  }

  if (!EMAIL_PATTERN.test(form.email.trim())) {
    return { ok: false, message: "Please enter a valid email" };
  }

  if (!getShopifyAdminConfig()) {
    console.error(
      "[shopify/forms] Admin API not configured — set SHOPIFY_ADMIN_ACCESS_TOKEN or SHOPIFY_PARTNER_APP_DIR",
    );
    return { ok: false, message: formsUnavailableMessage() };
  }

  try {
    await upsertContactCustomer(form);
    return { ok: true, message: "Thank you — we will be in touch shortly." };
  } catch (error) {
    console.error("[shopify/forms] Contact form failed:", error);
    return { ok: false, message: formsUnavailableMessage() };
  }
}
