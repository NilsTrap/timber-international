---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-Timber-World-2026-01-20.md'
  - '_bmad-output/analysis/platform-deep-analysis-2026-01-20.md'
  - '_bmad-output/analysis/platform-vision-capture-2026-01-20.md'
workflowType: 'prd'
lastStep: 3
date: 2026-01-21
---

# Product Requirements Document - Timber World Platform

**Author:** Nils
**Date:** 2026-01-21

---

## Executive Summary

### Product Vision

**Timber World Platform** is a B2B supply chain system that transforms how a timber production orchestrator operates. The platform automates operational workflows and provides self-service portals for all parties - clients, suppliers, producers, sales agents, and purchase managers - eliminating manual communication bottlenecks that currently consume 90% of team capacity.

The platform enables Timber World to scale from dozens to hundreds of partners and clients without proportional headcount growth, making small orders economically viable and freeing the team to focus on sales and network expansion.

### Problem Statement

Timber World operates as a "Production Orchestrator" - controlling timber through the entire supply chain while coordinating production across owned and partner facilities. The current operational model relies entirely on manual communication (email, WhatsApp, phone) and fragmented tools (Google Sheets, Google Drive).

**Current Pain Points:**
- Every order triggers 10+ manual tasks regardless of size (€500 or €50,000)
- 90% of team time goes to repetitive operational tasks
- Data scattered across email, spreadsheets, and chat histories
- No real-time visibility into inventory, production, or order status
- Salespeople do admin instead of selling
- Small orders are uneconomical due to fixed overhead
- Growth trap: more orders → need more people → need more money

### Proposed Solution

A unified portal platform with function-based access serving 6 user roles:

| Role | Portal Functions |
|------|------------------|
| **Clients** | Order, reorder, track shipments, view invoices |
| **Suppliers** | View orders, confirm deliveries, submit invoices |
| **Producers** | Accept jobs, report production, track efficiency |
| **Sales** | CRM, create quotes, manage pipeline, track orders |
| **Purchase** | Find suppliers, create POs, track deliveries |
| **Admins** | Full oversight, analytics, approvals |

### What Makes This Special

1. **Built for Production Orchestrators** - Designed for companies that coordinate rather than own all production; handles the complexity of external supplier and producer networks

2. **Platform as Partner Advantage** - System so good that suppliers and producers prefer working with Timber World over competitors

3. **Automation-First Design** - Default is automatic; human intervention is the exception; small orders viable because system effort is near-zero

4. **Unified System** - CRM + Operations + Procurement in ONE platform (replaces Pipedrive, Google Sheets, email coordination)

5. **Network Effects as Competitive Moat** - Once suppliers and clients see real deals flowing through an automated system, they become locked in; competitors would need to build both the platform AND the network simultaneously

---

## Project Classification

| Attribute | Value |
|-----------|-------|
| **Technical Type** | B2B SaaS Platform (`saas_b2b`) |
| **Domain** | Supply Chain / Manufacturing |
| **Complexity** | Medium-High |
| **Project Context** | Greenfield - new platform |

**Key Technical Considerations:**
- Multi-tenant architecture (clients, suppliers, producers as separate organizations)
- Role-based access control with function toggles per user
- Real-time inventory tracking across multiple locations
- Production transformation tracking (input → output)
- Document workflow automation (quotes, POs, invoices, CMRs)
- Future AI integration (automated procurement, quote generation)

---

## Success Criteria

### User Success

Each user type achieves their core workflow through the portal without reverting to email/WhatsApp/phone for standard tasks:

| User Type | Success Indicator | "Aha!" Moment |
|-----------|------------------|---------------|
| **Producers** | Report production input→output through portal; inventory visible in real-time | Efficiency report shows where to improve |
| **Suppliers** | Orders and invoices through portal; payment status visible | Payment status visible without asking |
| **Clients** | Documents, project orders, reorders through portal | First reorder takes 30 seconds instead of 30 minutes |
| **Sales** | Quotes created in system with real inventory data; pipeline managed | Quote created in 5 minutes, client approves same day |
| **Purchase** | POs created with real inventory data; deliveries tracked | PO created in 5 minutes, delivery tracked automatically |
| **Admins** | All operations visible in one dashboard | Morning check takes 10 minutes instead of 2 hours |

### Business Success

**Primary Success Indicator:**
> "I can see what inventory I sent to producers, what they made from it, what's the output, and current inventory levels everywhere - in real-time, without asking anyone."

| Timeframe | Objective | Success Criteria |
|-----------|-----------|------------------|
| **Month 1** | Production tracking live | 2-3 producers using portal, inventory tracked in real-time |
| **Month 1** | Basic client portal | Clients can submit documents and project orders through portal |
| **Month 2** | Supplier portal live | Suppliers confirm orders and submit invoices through system |
| **Month 3** | Sales CRM functional | Salespeople create quotes and manage pipeline in system |
| **Month 4** | Automation workflows | Order → PO → Production order flows automatically |
| **Month 6** | Full platform operational | All user types on portal, 90% reduction in manual tasks |

### Technical Success

| KPI | Current State | Target (Month 6) |
|-----|---------------|------------------|
| Inventory accuracy (system vs reality) | Unknown (manual) | >95% |
| Order status visibility | Via email/phone | 100% real-time |
| Production efficiency tracking | Manual spreadsheets | All producers tracked |

### Measurable Outcomes

**Operational Efficiency:**

| Metric | Current | Target (Month 6) |
|--------|---------|------------------|
| Time spent on ops tasks per order | ~90% of total time | <10% of total time |
| Orders manageable per person | ~10-20/month | 100+/month |
| Minimum viable order size | Large orders only | Any size viable |

**Platform Adoption:**

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Producers on portal | 2-3 | All active | All active |
| Clients on portal | First few | 50% | 80%+ |
| Suppliers on portal | - | First few | 50%+ |
| Sales using CRM | - | 100% | 100% |
| Purchase using portal | - | 100% | 100% |

**Network Effect Indicators (Competitive Moat):**

| Indicator | How to Measure |
|-----------|----------------|
| Partner preference | Suppliers/producers express preference for Timber World system |
| Lock-in evidence | Partners integrate workflows around Timber World portal |
| Deal velocity | Time from quote to closed deal decreases |
| Repeat business | Client reorder frequency increases |

---

## Product Scope

### MVP - Minimum Viable Product (Month 1-2)

**Must have for launch:**
- Producer Portal: inventory visibility, production reporting, efficiency tracking
- Client Portal: document submission, project orders, order status
- Admin functions: producer management, inventory oversight
- Supplier Portal: order viewing, delivery confirmation, invoice submission

**Not MVP but essential for validation:**
- Basic sales CRM: pipeline, quotes, client visibility (Month 3)
- Purchase management: POs, supplier tracking (Month 3)

### Growth Features (Post-MVP, Month 4-6)

| Feature | Purpose |
|---------|---------|
| Automation workflows | Order → PO → Production automatic flow |
| Document generation | Auto-create invoices, CMRs, packing lists |
| Email integration | Gmail sync for communication tracking |
| Advanced reporting | Producer comparisons, margin analysis |

### Vision (Future, Post-Month 6)

| Feature | When |
|---------|------|
| AI-powered quotation assistant | After Month 6 |
| Multi-language support | After Month 6 |
| Native mobile apps | After Month 6 |
| Bank/accounting integration | Future |
| API for third-party integrations | Future |
| Advanced AI for demand forecasting | Long-term |

### Explicitly Out of Scope for MVP

| Feature | Reason |
|---------|--------|
| AI chatbot for quotes | Not critical for operations |
| Multi-language | English first |
| Native mobile apps | Web portal works on mobile |
| E-signatures | Manual signatures OK initially |
| Marketing website updates | Separate project |

---
