# Plan: Enhance Leads and Customers Management & Restrict Profile Updates

The goal is to provide editing/deletion for leads, track unpaid balances for customers, and restrict specific profile fields to admins only. This plan ensures that while agents can view/update some profile info, sensitive fields like Agent Code, Position, Targets, and Status are strictly admin-managed.

## Scope
- **Leads:** Add UI and logic to edit and delete existing lead records.
- **Customers:** Add a field/logic to track "unpaid balance" per customer.
- **Profile Management:** Implement role-based field restrictions in the Agent/Profile update forms.
- **Data Persistence:** Update Supabase schema to support unpaid balances and ensure RLS policies allow these operations.

## Auth & RLS model
**Auth in scope:** yes
**Model:** supabase_auth
**RLS strategy:** `auth.uid()` will be used to ensure agents can only modify their own profiles (restricted fields) and their own leads/customers, while admins have full access.
**Frontend implication:** Forms will disable or hide fields based on the user's role. Toast notifications for permission errors.

## Migration baseline
**Local migrations in project:** existing
**User confirmed proceed on connected DB:** yes

## Affected Areas
- **Supabase:** New migration for customer balance and potentially lead soft-delete or policy updates.
- **Frontend:**
  - `src/pages/crm/Leads.tsx`: Edit/Delete UI and Supabase integration.
  - `src/pages/crm/Customers.tsx`: Balance tracking UI.
  - `src/components/admin/AgentForm.tsx` (or `Profile.tsx`): Role-based field disabling.

## Phases

### Phase 1: Database Schema & RLS
- **Owner:** `supabase_engineer`
- **Goal:** Update schema to support the new features.
- **Tasks:**
  - Create a migration to add `unpaid_balance` (numeric/decimal) to the `customers` table.
  - Ensure `leads` table allows DELETE for owners and admins (or add a `deleted_at` for soft delete if preferred, but request says "delete").
  - Verify RLS policies allow agents to read/write their assigned leads/customers.

### Phase 2: Leads Management (Edit/Delete)
- **Owner:** `frontend_engineer`
- **Goal:** Implement UI for modifying leads.
- **Tasks:**
  - Add "Edit" and "Delete" actions to the Leads table/list.
  - Create or update a Dialog/Form for editing lead details.
  - Connect actions to Supabase client.

### Phase 3: Customer Unpaid Balance Tracking
- **Owner:** `frontend_engineer`
- **Goal:** Allow admins and agents to track balances.
- **Tasks:**
  - Update Customer table/list to display `unpaid_balance`.
  - Add `unpaid_balance` field to the Customer creation/edit forms.

### Phase 4: Restricted Profile Updates
- **Owner:** `frontend_engineer`
- **Goal:** Prevent agents from changing sensitive fields.
- **Tasks:**
  - Identify where "update profile" happens for agents (likely `src/components/admin/AgentForm.tsx` or `src/pages/profile/Profile.tsx`).
  - Use `AuthContext` to check the current user's role.
  - Disable input fields for `agent_code`, `position`, `targets`, and `status` if the user is not an admin.

## Execution Handoff

**Plan status:** ready

**Dispatch order:**
1. supabase_engineer — Schema updates for customer balance and RLS verification.
2. frontend_engineer — Implementation of Lead CRUD, Customer balance UI, and Profile field restrictions.

**Per-agent instructions:**

### 1. supabase_engineer
- **Phases:** Phase 1
- **Scope:** `supabase/migrations/`
- **Tasks:**
  - Add `unpaid_balance` column to `customers` table (default 0).
  - Review RLS for `leads` and `customers` to ensure agents can manage their own data while admins manage all.
- **Acceptance criteria:** Migration applied; `unpaid_balance` column exists.

### 2. frontend_engineer
- **Phases:** Phase 2, 3, 4
- **Scope:** `src/pages/crm/`, `src/components/admin/AgentForm.tsx`, `src/pages/profile/Profile.tsx`
- **Tasks:**
  - Implement Edit/Delete for Leads in `src/pages/crm/Leads.tsx`.
  - Add `unpaid_balance` tracking in `src/pages/crm/Customers.tsx`.
  - Restrict `agent_code`, `position`, `targets`, and `status` fields in agent update forms to `admin` role only.
- **Acceptance criteria:** Leads can be deleted/edited; Customer balances are visible/editable; Agents cannot change their own codes/targets.
