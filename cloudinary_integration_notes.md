# Cloudinary integration notes

Cloudinary’s official Node.js documentation supports server-side uploads using a product-environment cloud name, API key, and API secret. Those values can be supplied separately or through a `CLOUDINARY_URL` server environment variable in the form `cloudinary://<api_key>:<api_secret>@<cloud_name>`. The API secret must remain server-side and must never be committed to GitHub.[1][2]

For this platform, the Cloudinary adapter will upload only validated JPG, PNG, and WEBP question images within the existing 4 MB limit. It will preserve the existing storage contract by returning a stable asset key and Cloudinary `secure_url`, which can be rendered in the student interface and passed to the vision-capable external assistant.

## Required secure variable

| Variable | Format | Use |
|---|---|---|
| `CLOUDINARY_URL` | `cloudinary://<api_key>:<api_secret>@<cloud_name>` | Server-side authenticated image upload and delivery. |

## References

[1]: https://cloudinary.com/documentation/finding_your_credentials_tutorial "Cloudinary: Find your credentials"
[2]: https://cloudinary.com/documentation/node_integration "Cloudinary: Node.js SDK"
