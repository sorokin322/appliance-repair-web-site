# Anton Appliance Services — Website

A single-page professional website for Anton Appliance Services, built with plain HTML, CSS, and JavaScript. No build step required.

## Project Structure

```
index.html          Main (and only) page
css/styles.css      All styles — responsive, mobile-first
js/main.js          Interactions — nav, modal, scroll animations
images/hero.jpg     Hero section background photo
```

---

## Deploying to GitHub Pages

This site is static HTML — GitHub Pages can serve it directly from the repository with zero configuration.

### Who Can Enable GitHub Pages?

Only the **repository owner** (the person who owns the GitHub account where the repo lives) can turn on GitHub Pages. If you are a **contributor** with write access to the repo, you can push code changes, but you cannot enable or configure Pages — the owner must do that step.

### Instructions for the Repository Owner

1. Go to the repository on GitHub:
   `https://github.com/sorokin322/appliance-repair-web-site`

2. Click **Settings** (the gear icon tab at the top of the repo).

3. In the left sidebar, click **Pages**.

4. Under **"Build and deployment"**:
   - **Source**: select **"Deploy from a branch"**
   - **Branch**: select **`main`**
   - **Folder**: select **`/ (root)`**

5. Click **Save**.

6. Wait 1–2 minutes. GitHub will build and deploy the site.

7. The site will be live at:
   ```
   https://sorokin322.github.io/appliance-repair-web-site/
   ```

8. A green checkmark will appear on the Pages settings page once deployment is complete.

### Custom Domain (Optional)

If you want to use a custom domain (e.g., `antonapplianceservices.com`):

1. In the **Pages** settings, enter your custom domain and click **Save**.
2. GitHub will create a `CNAME` file in your repo automatically.
3. At your domain registrar, add a **CNAME** DNS record:
   - Name: `www` (or `@` for apex)
   - Value: `sorokin322.github.io`
4. For apex domains, add **A** records pointing to GitHub's IPs (check [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) for current IPs).
5. Check **"Enforce HTTPS"** on the Pages settings page once DNS propagates.

### For Contributors

As a contributor, your workflow is:

1. Clone the repo and make changes locally.
2. Commit and push to `main`.
3. GitHub Pages will **automatically redeploy** within ~1 minute after each push to `main`.
4. You do **not** need to do anything else — the owner's one-time setup handles all deployments.

---

## Changing the Default Branch to `main`

If the default branch was set to a feature branch (e.g., `feat_re_design`) instead of `main`, GitHub Pages and new clones will use the wrong branch until this is fixed.

### Instructions for the Repository Owner

1. Go to the repository on GitHub:
   `https://github.com/sorokin322/appliance-repair-web-site`

2. Click **Settings** (the gear icon tab at the top of the repo).

3. In the left sidebar, click **General**.

4. Under **Default branch**, click the switch/edit icon next to the current branch name.

5. Select **`main`** from the dropdown.

6. Click **Update**, then confirm with **I understand, update the default branch**.

After this change, the repo homepage and GitHub Pages (if configured to deploy from `main`) will use the correct branch.

### For Contributors

Contributors cannot change the default branch. If you do not see the **Settings** tab, ask the repository owner to follow the steps above.

To sync your local repo after the default branch is updated:

```bash
git fetch origin
git checkout main
git pull origin main
```

---

## Setting Up Resend.com (Email Service for the Booking Form)

### Why Resend?

The "Book Now" button on the website opens a booking form. When a customer fills it out, the form data needs to be emailed to you. **Resend** is the email delivery service we use because:

- **Developer-friendly**: simple REST API, easy to integrate
- **Free tier**: 100 emails/day, 3,000 emails/month — more than enough for a local business
- **Reliable deliverability**: emails reach inboxes, not spam folders
- **No server required**: can be called from a lightweight serverless function (Cloudflare Workers, Vercel Edge Functions, etc.)
- **Modern**: unlike legacy services (SendGrid, Mailgun), Resend has a clean dashboard and straightforward setup

### Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com) and click **"Get started"**.
2. Sign up with your email (or use GitHub login).
3. Verify your email address.

### Step 2: Get an API Key

1. In the Resend dashboard, go to **API Keys** (left sidebar).
2. Click **"Create API Key"**.
3. Name it something like `anton-website-booking`.
4. Set permission to **"Sending access"** (that's all you need).
5. Copy the key — it looks like `re_xxxxxxxxx`. **Save it securely; you won't see it again.**

### Step 3: Verify Your Domain (Recommended)

By default, Resend lets you send from `onboarding@resend.dev` (for testing). For production, verify your own domain:

1. Go to **Domains** in the Resend dashboard.
2. Click **"Add Domain"** and enter your domain (e.g., `sorokin.com` or `antonapplianceservices.com`).
3. Resend will give you DNS records (SPF, DKIM, DMARC) to add at your domain registrar.
4. Add those records and click **"Verify"** in Resend.
5. Once verified, you can send emails from any address at that domain (e.g., `booking@antonapplianceservices.com`).

If you don't have a custom domain, you can skip this and use a serverless function that sends from Resend's default domain for testing.

### Step 4: Create a Serverless Endpoint

The booking form needs a small backend endpoint to securely call the Resend API (you should never expose your API key in client-side code). Here are two free options:

#### Option A: Cloudflare Workers (Recommended — free, fast, no credit card)

1. Sign up at [https://workers.cloudflare.com](https://workers.cloudflare.com).
2. Create a new Worker and paste this code:

```javascript
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { name, email, phone, message } = await request.json();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Booking Form <booking@antonapplianceservices.com>',
        to: 'anton.sorokin@gmail.com',
        subject: `New Booking Request from ${name}`,
        html: `
          <h2>New Booking Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong> ${message}</p>
        `,
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
```

3. In the Worker settings, add an **Environment Variable**:
   - Name: `RESEND_API_KEY`
   - Value: your Resend API key (`re_xxxxxxxxx`)
4. Deploy the Worker.
5. Copy the Worker URL (e.g., `https://booking-form.your-account.workers.dev`).

#### Option B: Vercel Serverless Function

If you prefer Vercel, create an `api/send.js` file in a Vercel project with similar logic.

### Step 5: Connect the Form to the Endpoint

1. Open `js/main.js` in this repo.
2. Find the commented-out `fetch` block inside the form submit handler.
3. Uncomment that block.
4. Replace `'YOUR_SERVERLESS_ENDPOINT_URL'` with your Worker URL.
5. Remove the `disabled` attribute from the submit button in `index.html` (search for `booking-form__submit`).
6. Commit and push — the form is now live.

---

## Development

No build step is needed. To develop locally:

1. Clone the repo:
   ```bash
   git clone https://github.com/sorokin322/appliance-repair-web-site.git
   cd appliance-repair-web-site
   ```

2. Open `index.html` in a browser, or use any local server:
   ```bash
   # Python 3
   python3 -m http.server 8000

   # Node.js (if npx is available)
   npx serve .
   ```

3. Edit HTML, CSS, or JS files. Refresh the browser to see changes.

---

## Replacing Placeholder Images

The service section uses Unsplash placeholder images. To replace them:

1. Take or source photos of actual repair work.
2. Place them in the `images/` folder.
3. Update the `<img src="...">` URLs in `index.html` to point to local files (e.g., `images/fridge-repair.jpg`).
