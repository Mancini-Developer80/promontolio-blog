# Promontolio

## Full-Stack CMS and cloud-native platform on Google Cloud

Promontolio is a full-stack editorial and commerce platform for an Italian
artisan brand. The project combines a content management system, an
administrative dashboard, bilingual Italian/German content, lead capture,
newsletter and guide delivery, contact forms, checkout, and media management.

The repository also demonstrates application architecture and cloud
engineering practices: the Node.js application is containerized with Docker,
published to Artifact Registry, and deployed to Cloud Run through Terraform and
GitHub Actions.

## Highlights

### Cloud Architecture and DevOps

- **Google Cloud Run** for serverless execution of the Node.js container.
- **Artifact Registry** as the private Docker image registry.
- **Terraform** for declarative provisioning of GCP APIs, Artifact Registry,
  Cloud Run, and Workload Identity Federation.
- **GitHub Actions CI/CD** with OIDC authentication to Google Cloud, avoiding
  static service-account keys in the repository.
- A delivery pipeline covering tests, Prisma client generation, database
  migrations, Docker image build/push, and Cloud Run deployment.
- Separate GitHub `staging` and `production` environments.
- Application configuration and secrets supplied through environment variables
  and Secret Manager during deployment.

### Full-Stack Development

- MVC backend built with **Node.js**, **Express 5**, and domain-focused
  controllers.
- Server-side rendering with **EJS**, Italian/German localization, and
  canonical and alternate SEO URLs.
- Responsive frontend built with **Sass/SCSS**, vanilla JavaScript, and
  progressive enhancement: forms also work without JavaScript.
- Administrative CMS for articles, media, users, roles, and statistics.
- Passport.js authentication, PostgreSQL-backed sessions, and RBAC for
  `AUTHOR`, `EDITOR`, `ADMIN`, and `SUPER` roles.
- Contact form with server-side validation, privacy consent, honeypot,
  rate limiting, message persistence, and email delivery status.
- Double Opt-In lifecycle for the newsletter and guide:
  `PENDING`, `CONFIRMED`, `UNSUBSCRIBED`, hashed random tokens, and consent
  withdrawal.
- SMTP integration with Nodemailer, bilingual emails, PDF attachments, and
  `replyTo` support for direct replies to form senders.
- Stripe checkout and media processing with Multer, Sharp, and Cloudinary.

## Application Architecture

```text
Browser
   |
   v
Cloud Run
   |
   +-- Express / Passport / EJS
   +-- Prisma Client
   +-- Nodemailer / Stripe / Cloudinary
   |
   v
PostgreSQL
```

The codebase follows an MVC architecture:

- `routes/`: public, authentication, and administrative routing;
- `controllers/`: application logic and use-case orchestration;
- `services/`: external integrations, especially email;
- `middleware/`: authentication, authorization, security, and rate limiting;
- `views/`: server-rendered EJS templates;
- `public/` and `sass/`: frontend assets and styles;
- `prisma/`: PostgreSQL schema, client, and migrations;
- `terraform/`: infrastructure as code for GCP;
- `.github/workflows/`: CI/CD automation.

## Technology Stack

| Area | Technology |
| :--- | :--- |
| Runtime | Node.js 20 |
| Backend | Express 5 |
| Frontend | EJS, vanilla JavaScript, Sass/SCSS |
| Database | PostgreSQL 16 |
| ORM and migrations | Prisma |
| Sessions | Express Session + Prisma Session Store |
| Authentication | Passport.js, Passport Local |
| Security | Helmet, CORS, rate limiting, input validation |
| Email | Nodemailer with Gmail SMTP |
| Payments | Stripe |
| Media | Multer, Sharp, Cloudinary |
| Containers | Docker, Docker Compose |
| Cloud runtime | Google Cloud Run |
| Container registry | Google Artifact Registry |
| Infrastructure as code | Terraform |
| CI/CD | GitHub Actions + Workload Identity Federation |

## GCP Infrastructure

The configuration in `terraform/` defines:

- the Google Cloud provider in the `europe-west3` region;
- the required Google Cloud APIs;
- a Docker repository in Artifact Registry;
- a GitHub OIDC Workload Identity Pool and provider;
- IAM bindings that enable keyless deployment;
- a Cloud Run service with CPU and memory limits and a versioned image;
- an output exposing the public service URL.

The release flow is:

```text
git push (staging/main)
        |
        v
GitHub Actions
  - npm ci
  - prisma generate
  - prisma migrate deploy
  - npm test
  - docker build
  - docker push -> Artifact Registry
  - deploy -> Cloud Run
```

## Docker and Local Development

The `Dockerfile` uses a multi-stage build:

1. install dependencies;
2. generate the Prisma client;
3. remove development dependencies;
4. run a lightweight Node.js production image.

Start PostgreSQL locally with:

```bash
npm run docker:up
```

Install dependencies, apply migrations, and create the initial superuser with:

```bash
npm run setup
```

Run the development server and Sass watcher with:

```bash
npm run dev
npm run watch:sass
```

## Configuration

Copy `.env.example` to `.env` and provide the required values. Production
secrets must never be committed to the repository: the deployment pipeline
loads sensitive values from Google Secret Manager.

Important variables include:

- `DATABASE_URL`: PostgreSQL connection string;
- `SESSION_SECRET`: long, randomly generated session secret;
- `APP_URL`: public application URL;
- `STRIPE_SECRET_KEY`: private Stripe key;
- `EMAIL_USER` and `EMAIL_PASS`: SMTP credentials or an app password;
- Cloudinary credentials for media management;
- initial superuser credentials for bootstrap only.

## Quality, Security, and Reliability

- Client-side and server-side validation.
- HTML escaping in emails to prevent injection through interpolated content.
- Security headers provided by Helmet.
- Global, API, and contact-form rate limiting.
- Same-origin checks for form requests.
- `httpOnly` session cookies with `secure` enabled in production and
  PostgreSQL-backed session storage.
- Versioned migrations applied through `prisma migrate deploy`.
- Automated tests covering localization, links, HTTP smoke checks, validation,
  contact forms, and public controllers.
- Persistent lead and contact-message records even when email delivery fails.

## Tests and Useful Commands

```bash
npm test
npm run build
npx prisma validate
npx prisma migrate status
terraform -chdir=terraform init
terraform -chdir=terraform fmt -check
terraform -chdir=terraform validate
```

## Architectural Notes

- PostgreSQL and Prisma represent the current application data path. Some
  legacy Mongoose models are still present and should only be removed after
  compatibility with any external process has been verified.
- Cloud Run is stateless: persistent application state must remain in
  PostgreSQL or external services, not in the container filesystem.
- Before a production release, verify database backups, SPF/DKIM/DMARC for the
  email domain, IAM policies, and secret-management configuration.

## License

ISC
