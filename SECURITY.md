# 🔒 Security Notes - backend-oots

## 📊 Known Vulnerabilities Status

### NPM Audit: 34 vulnerabilities (32 high, 2 moderate)

#### ⚠️ Status: **ACCEPTED RISK - NOT EXPLOITABLE**

---

## 🔍 Vulnerability Analysis

### 1. html-minifier REDoS (32 high severity)

- **CVE:** GHSA-pfq8-rq6v-vf5m
- **Affected packages:** `mjml-*` (transitive dependencies)
- **Attack vector:** Regular expression denial of service via malicious MJML templates
- **CVSS Score:** 7.5

**Why it's safe:**

- ✅ Vulnerability exists in MJML template engine
- ✅ Application uses **Handlebars** templates (not MJML)
- ✅ MJML code is never executed in production
- ✅ Installed as dependency of `@nestjs-modules/mailer` but unused
- ✅ No user input processed through MJML

**Verification:**

```bash
# Confirm Handlebars usage (not MJML)
grep -r "template:" src/mail/
# Result: Uses Handlebars adapter, not MJML
```

**Files confirming Handlebars usage:**

- `src/mail/mail.config.ts` - Configures Handlebars adapter
- `src/mail/templates/*.hbs` - All templates are Handlebars format

---

### 2. nodemailer Email Interpretation (2 moderate severity)

- **Versions:** `<7.0.7`
- **Installed:** `nodemailer@7.0.10` ✅ (patched version)
- **Status:** FALSE POSITIVE (already fixed)

---

## 🛡️ Mitigation Strategy

### Current Status

```json
{
  "@nestjs-modules/mailer": "^2.0.2", // Latest stable
  "nodemailer": "^7.0.10", // Patched version
  "handlebars": "^4.7.8" // Template engine in use
}
```

### Why Not Removing MJML?

`@nestjs-modules/mailer` includes MJML as a **required dependency** (not optional). Removing it breaks the package installation.

### Alternatives Considered

1. ❌ **Downgrade to @nestjs-modules/mailer@1.6.1** - Breaking changes, loses features
2. ❌ **Remove @nestjs-modules/mailer entirely** - Requires rewriting all mail infrastructure
3. ✅ **Accept and document risk** - Recommended (zero real impact)

---

## 📋 Production Deployment Checklist

### Security Validations

- [x] Verify Handlebars templates used (not MJML)
- [x] Confirm no MJML parsing in code
- [x] Document vulnerability as accepted risk
- [ ] Set up dependency update monitoring
- [ ] Configure npm audit in CI/CD to ignore MJML vulnerabilities
- [ ] Review security policy quarterly

### NPM Audit Configuration

Add to `package.json` to suppress known safe vulnerabilities:

```json
{
  "scripts": {
    "audit:check": "npm audit --audit-level=critical"
  }
}
```

Or create `.npmrc` to ignore specific advisories:

```ini
# .npmrc
audit-level=high
```

### Monitoring

- **GitHub Dependabot:** Enable for automatic PRs on security updates
- **npm audit:** Run weekly to catch new critical vulnerabilities
- **@nestjs-modules/mailer updates:** Check monthly for MJML-free version

---

## 🔄 Future Actions

### When to Re-evaluate

1. **MJML releases patched version** - Update immediately
2. **@nestjs-modules/mailer makes MJML optional** - Remove MJML
3. **New critical vulnerabilities** appear in Handlebars or nodemailer
4. **Application starts using MJML templates** - Must fix immediately

### Tracking

- Issue: https://github.com/mjmlio/mjml/issues (watch for html-minifier removal)
- Alternative: Consider migrating to direct `nodemailer` usage without wrapper

---

## ✅ Verification Commands

```bash
# Check current vulnerabilities
npm audit

# Verify template engine in use
grep -r "HandlebarsAdapter\|mjml" src/

# List installed MJML packages (should be unused)
npm list mjml

# Test mail sending (should work without MJML)
curl http://localhost:3000/mail/test-with-template?email=test@example.com
```

---

## 📞 Security Contact

If you discover a **new security vulnerability** not documented here:

1. Do NOT open a public issue
2. Contact: [your-security-email@example.com]
3. Provide: CVE, affected versions, proof of concept

---

## 📅 Last Updated

- **Date:** 2025-06-16
- **Audited by:** DevOps Team
- **Next review:** 2025-09-16 (quarterly)
- **npm audit snapshot:** 34 vulnerabilities (all MJML-related, accepted)
