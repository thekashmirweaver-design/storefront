import { readFileSync, statSync } from "node:fs";
import { basename } from "node:path";

function mimeTypeFor(filename) {
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

/** COLLECTION_IMAGE (and some other types) return a bare GCS base URL — append the upload key. */
function resolveStagedResourceUrl(target) {
  const key = target.parameters?.find((p) => p.name === "key")?.value;
  if (!key || target.resourceUrl.includes(key)) {
    return target.resourceUrl;
  }
  const base = target.resourceUrl.replace(/\/$/, "");
  return `${base}/${key}`;
}

/**
 * Upload a local file via stagedUploadsCreate + multipart POST.
 * Returns the staged resourceUrl for productCreateMedia / fileCreate.
 */
export async function stageLocalImage(adminRequest, filePath, resource = "PRODUCT_IMAGE") {
  if (!filePath) throw new Error("Missing file path for image upload");
  const buffer = readFileSync(filePath);
  const fileSize = statSync(filePath).size;
  const filename = basename(filePath);
  const mimeType = mimeTypeFor(filename);

  const data = await adminRequest(
    `mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    {
      input: [
        {
          filename,
          mimeType,
          resource,
          fileSize: String(fileSize),
          httpMethod: "POST",
        },
      ],
    },
  );

  const errors = data.stagedUploadsCreate?.userErrors ?? [];
  if (errors.length) throw new Error(`stagedUploadsCreate: ${JSON.stringify(errors)}`);

  const target = data.stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const param of target.parameters) {
    form.append(param.name, param.value);
  }
  form.append("file", new Blob([buffer], { type: mimeType }), filename);

  const upload = await fetch(target.url, { method: "POST", body: form });
  if (!upload.ok) {
    throw new Error(`Image upload failed (${upload.status}) for ${filename}`);
  }

  return resolveStagedResourceUrl(target);
}

export async function productHasMedia(adminRequest, productId) {
  const data = await adminRequest(
    `query ProductMedia($id: ID!) {
      product(id: $id) { media(first: 1) { nodes { id } } }
    }`,
    { id: productId },
  );
  return (data.product?.media?.nodes?.length ?? 0) > 0;
}

export async function createShopifyFile(adminRequest, resourceUrl, alt) {
  const data = await adminRequest(
    `mutation FileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          ... on MediaImage {
            image { url }
          }
        }
        userErrors { field message }
      }
    }`,
    {
      files: [
        {
          originalSource: resourceUrl,
          contentType: "IMAGE",
          alt: alt ?? undefined,
        },
      ],
    },
  );

  const errors = data.fileCreate?.userErrors ?? [];
  if (errors.length) throw new Error(`fileCreate: ${JSON.stringify(errors)}`);

  const url = data.fileCreate.files?.[0]?.image?.url;
  if (!url) throw new Error("fileCreate returned no image URL");
  return url;
}

export async function replaceProductMedia(adminRequest, productId, imageEntries) {
  const existing = await adminRequest(
    `query ProductMedia($id: ID!) {
      product(id: $id) {
        media(first: 50) {
          nodes { id }
        }
      }
    }`,
    { id: productId },
  );

  const mediaIds = existing.product?.media?.nodes?.map((n) => n.id) ?? [];
  if (mediaIds.length) {
    const deleted = await adminRequest(
      `mutation ProductDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
        productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
          mediaUserErrors { field message }
        }
      }`,
      { productId, mediaIds },
    );
    const delErrors = deleted.productDeleteMedia?.mediaUserErrors ?? [];
    if (delErrors.length) throw new Error(`productDeleteMedia: ${JSON.stringify(delErrors)}`);
  }

  const media = [];
  for (const entry of imageEntries) {
    const resourceUrl = await stageLocalImage(adminRequest, entry.file, "PRODUCT_IMAGE");
    media.push({
      originalSource: resourceUrl,
      alt: entry.alt,
      mediaContentType: "IMAGE",
    });
  }

  const created = await adminRequest(
    `mutation ProductCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        mediaUserErrors { field message }
      }
    }`,
    { productId, media },
  );

  const createErrors = created.productCreateMedia?.mediaUserErrors ?? [];
  if (createErrors.length) throw new Error(`productCreateMedia: ${JSON.stringify(createErrors)}`);
}

/** Staged upload for collectionUpdate(image.src) — use COLLECTION_IMAGE + resourceUrl. */
export async function uploadCollectionImage(adminRequest, imageEntry) {
  return stageLocalImage(adminRequest, imageEntry.file, "COLLECTION_IMAGE");
}

/** Staged upload for articleCreate/articleUpdate(image.url). */
export async function uploadArticleImage(adminRequest, imageEntry) {
  return stageLocalImage(adminRequest, imageEntry.file, "IMAGE");
}
