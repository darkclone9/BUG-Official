# Store Credit Admin Guide

This guide is for BUG Gaming Club administrators (President, Co-President) who manage the store credit system.

---

## 📖 Table of Contents

1. [Admin Access](#admin-access)
2. [Managing Multiplier Campaigns](#managing-multiplier-campaigns)
3. [Awarding Manual Credit](#awarding-manual-credit)
4. [Approving Credit Transactions](#approving-credit-transactions)
5. [Configuring System Settings](#configuring-system-settings)
6. [Viewing Reports & Analytics](#viewing-reports--analytics)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Admin Access

### Who Can Manage Store Credit?

Only users with the following roles can manage store credit:
- **President** (`president` role)
- **Co-President** (`co_president` role)

Regular admins **cannot** manage store credit to prevent unauthorized modifications.

### Accessing Admin Tools

1. Log in to your admin account
2. Navigate to **Admin Panel** → **Promotions**
3. You'll see three tabs:
   - **Credit Multipliers** - Manage bonus credit campaigns
   - **Credit Giveaways** - Award manual credit to users
   - **Shop Management** - Approve pending credit transactions

---

## Managing Multiplier Campaigns

Multiplier campaigns let you run special promotions where users earn bonus credit (2x, 3x, etc.).

### Creating a Multiplier Campaign

1. Go to **Admin Panel** → **Promotions** → **Credit Multipliers**
2. Click **Create New Multiplier**
3. Fill in the form:

**Campaign Name**
- Example: "2x Credit Weekend"
- Keep it short and descriptive

**Description**
- Example: "Earn double credit on all activities this weekend!"
- Explain what the campaign offers

**Multiplier Value**
- Enter a number (e.g., 2.0 for 2x, 1.5 for 1.5x, 3.0 for 3x)
- Common values: 1.5x, 2.0x, 2.5x, 3.0x

**Start Date & Time**
- When the campaign begins
- Use your local timezone

**End Date & Time**
- When the campaign ends
- Must be after start date

**Applicable Categories**
- Select which activities get the multiplier:
  - ✅ Event Attendance
  - ✅ Volunteer Work
  - ✅ Event Hosting
  - ✅ Contribution
- You can select multiple categories

**Active Status**
- ✅ Active - Campaign is running (if within date range)
- ❌ Inactive - Campaign is paused

4. Click **Create Multiplier**

### Example Campaign

**Name:** "Tournament Triple Credit"  
**Description:** "Earn 3x credit for attending tournaments this month!"  
**Multiplier:** 3.0  
**Start Date:** 2025-11-01 00:00  
**End Date:** 2025-11-30 23:59  
**Categories:** Event Attendance  
**Active:** Yes

**Result:** Users earn $3.00 instead of $1.00 for attending events during November.

### Editing a Campaign

1. Find the campaign in the list
2. Click **Edit**
3. Modify any fields
4. Click **Save Changes**

**Note:** Changes take effect immediately.

### Deactivating a Campaign

To pause a campaign without deleting it:
1. Click **Edit** on the campaign
2. Uncheck **Active**
3. Click **Save Changes**

To reactivate, check **Active** again.

### Deleting a Campaign

1. Click **Delete** on the campaign
2. Confirm deletion

**Warning:** This cannot be undone. Consider deactivating instead.

### Campaign Status Indicators

- 🟢 **Active** - Campaign is currently running
- 🟡 **Scheduled** - Campaign starts in the future
- 🔴 **Ended** - Campaign has finished
- ⚫ **Inactive** - Campaign is paused

---

## Awarding Manual Credit

Use this feature to give credit to users for special contributions, corrections, or promotions.

### Creating a Credit Giveaway

1. Go to **Admin Panel** → **Promotions** → **Credit Giveaways**
2. Click **Create New Giveaway**
3. Fill in the form:

**Giveaway Name**
- Example: "Welcome Bonus" or "Bug Fix Reward"
- Internal reference name

**Description**
- Example: "Thank you for reporting the checkout bug!"
- This appears in the user's transaction history

**Credit Amount**
- Enter dollar amount (e.g., 5.00 for $5.00)
- Minimum: $0.50
- Maximum: $100.00 per giveaway

**Category**
- Select the reason:
  - **Adjustment** - Corrections or manual adjustments
  - **Contribution** - Special contributions
  - **Welcome Bonus** - New user bonuses
  - **Event Hosting** - Manual event hosting credit
  - **Volunteer Work** - Manual volunteer credit

**Target Users**
- **Specific User** - Award to one user (enter email)
- **All Active Users** - Award to all users who logged in recently
- **All Users** - Award to everyone
- **New Users** - Award to users who joined after a specific date

4. Click **Execute Giveaway**

### Example Giveaways

#### Individual Reward
**Name:** "Bug Report Reward"  
**Description:** "Thank you for reporting the shop checkout bug!"  
**Amount:** $5.00  
**Category:** Contribution  
**Target:** john.doe@example.com

#### Bulk Welcome Bonus
**Name:** "New Member Welcome"  
**Description:** "Welcome to BUG Gaming Club! Here's $10 to get you started."  
**Amount:** $10.00  
**Category:** Welcome Bonus  
**Target:** New Users (joined after 2025-11-01)

### Important Notes

- ✅ Manual giveaways are **auto-approved** (no approval needed)
- ✅ Credit is added **immediately** to user accounts
- ✅ Users see the giveaway in their transaction history
- ❌ Giveaways **cannot be undone** (use negative adjustment to correct)

### Correcting Errors

If you awarded too much credit by mistake:
1. Create a new giveaway
2. Use **Adjustment** category
3. Enter the **negative amount** (e.g., -5.00 to deduct $5.00)
4. Target the specific user
5. Explain the reason in the description

---

## Approving Credit Transactions

Some credit earnings require manual approval (volunteer work, event hosting, contributions).

### Viewing Pending Transactions

1. Go to **Admin Panel** → **Shop** → **Credit Approval**
2. You'll see a list of pending transactions:
   - User name and email
   - Amount requested
   - Reason/description
   - Category
   - Date submitted

### Approving Credit

1. Review the transaction details
2. Verify the user actually performed the activity
3. Click **Approve**
4. The credit is added to the user's balance immediately

### Denying Credit

1. Review the transaction
2. If invalid or incorrect, click **Deny**
3. Optionally add a reason (sent to user)
4. The transaction is marked as denied

**Note:** Denied transactions do not affect the user's balance.

### Approval Guidelines

**Approve if:**
- ✅ User actually attended/volunteered/hosted
- ✅ Amount matches the activity performed
- ✅ Activity aligns with club values

**Deny if:**
- ❌ User didn't actually perform the activity
- ❌ Amount is incorrect or inflated
- ❌ Duplicate request for same activity
- ❌ Activity doesn't qualify for credit

### Auto-Approved Transactions

These transactions don't need approval:
- Event attendance (via QR code check-in)
- Shop purchases (automatic deduction)
- Admin giveaways
- Migration credits

---

## Configuring System Settings

Adjust earning caps, discount caps, and earning values.

### Accessing Settings

1. Go to **Admin Panel** → **Settings** → **Store Credit**
2. You'll see the current configuration

### Settings Explained

#### Monthly Earning Cap
- **Default:** $50.00 per month
- **Purpose:** Prevents abuse, keeps system sustainable
- **Recommendation:** Keep at $50.00 unless you have a specific reason to change

#### Per-Item Discount Cap
- **Default:** 50% (users can use credit for up to 50% off each item)
- **Purpose:** Ensures items aren't completely free
- **Recommendation:** Keep at 50%

#### Per-Order Discount Cap
- **Default:** $30.00 per order
- **Purpose:** Limits total credit used per checkout
- **Recommendation:** Adjust based on average order values

#### Earning Values

**Event Attendance:** $1.00 (default)
- Credit earned per event attended

**Volunteer Work:** $2.50 (default)
- Credit earned per volunteer session

**Event Hosting:** $5.00 (default)
- Credit earned per event hosted

**Contribution (Min/Max):** $0.50 - $1.50 (default)
- Range for special contributions

### Changing Settings

1. Click **Edit Settings**
2. Modify the values
3. Click **Save Changes**

**Warning:** Changes affect all future transactions immediately.

### Best Practice Settings

For a typical club (50-100 members):
- Monthly Cap: $50.00
- Per-Item Cap: 50%
- Per-Order Cap: $30.00
- Event Attendance: $1.00
- Volunteer Work: $2.50
- Event Hosting: $5.00

---

## Viewing Reports & Analytics

### User Credit Balances

View all users' credit balances:
1. Go to **Admin Panel** → **Users**
2. Sort by **Store Credit Balance**
3. See who has the most/least credit

### Transaction History

View all credit transactions:
1. Go to **Admin Panel** → **Reports** → **Credit Transactions**
2. Filter by:
   - Date range
   - User
   - Category
   - Approval status

### Monthly Earnings Report

See how much credit was earned this month:
1. Go to **Admin Panel** → **Reports** → **Monthly Earnings**
2. View breakdown by category
3. Export to CSV if needed

### Top Earners

See most active members:
1. Go to **Admin Panel** → **Reports** → **Top Earners**
2. View leaderboard of credit earned
3. Recognize active members!

---

## Best Practices

### Running Multiplier Campaigns

✅ **DO:**
- Announce campaigns in advance (1 week notice)
- Run campaigns during high-activity periods (tournaments, events)
- Use clear, descriptive names
- Set realistic end dates
- Monitor participation during campaigns

❌ **DON'T:**
- Run too many campaigns at once (confusing)
- Set multipliers too high (>3x can be unsustainable)
- Forget to deactivate ended campaigns
- Change multipliers mid-campaign

### Awarding Manual Credit

✅ **DO:**
- Document the reason clearly
- Verify the user deserves the credit
- Use appropriate categories
- Be consistent with amounts

❌ **DON'T:**
- Award credit without justification
- Use excessive amounts
- Award to yourself (conflict of interest)
- Forget to notify the user

### Approving Transactions

✅ **DO:**
- Review within 24-48 hours
- Verify activity actually occurred
- Communicate with users about denials
- Keep records of approvals

❌ **DON'T:**
- Auto-approve without checking
- Deny without explanation
- Show favoritism
- Delay approvals unnecessarily

### System Settings

✅ **DO:**
- Document any changes you make
- Announce changes to users
- Monitor impact after changes
- Keep settings sustainable

❌ **DON'T:**
- Change settings frequently
- Set caps too low (frustrating) or too high (unsustainable)
- Forget to test changes
- Make changes without stakeholder approval

---

## Troubleshooting

### User reports incorrect balance

1. Check their transaction history
2. Verify all transactions are correct
3. Look for pending transactions
4. Check if monthly cap was reached
5. Use adjustment giveaway to correct if needed

### Multiplier not applying

1. Check if campaign is **Active**
2. Verify current date is within campaign date range
3. Check if category matches the activity
4. Refresh the page and try again

### Cannot approve transaction

1. Verify you have President/Co-President role
2. Check if transaction is already approved/denied
3. Try refreshing the page
4. Check browser console for errors

### User earned more than monthly cap

This shouldn't happen (system enforces cap), but if it does:
1. Check transaction history for the month
2. Verify monthly reset date
3. Report bug to development team
4. Use negative adjustment to correct if needed

---

## Support

For technical issues or questions:
- Contact the development team
- Check the implementation plan: `docs/STORE_CREDIT_IMPLEMENTATION_PLAN.md`
- Review user guide: `docs/STORE_CREDIT_USER_GUIDE.md`

For policy questions:
- Consult with club leadership
- Review club bylaws and policies

---

**Remember:** The store credit system is a privilege for members. Use your admin powers responsibly and fairly! 🎮✨

