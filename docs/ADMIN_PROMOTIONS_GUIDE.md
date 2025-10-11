# Admin Promotions & Campaigns Management Guide

**Last Updated:** 2025-10-11  
**Feature:** Admin Event/Promotion Management Tool  
**Access:** Admin Panel → Promotions

---

## 📋 Overview

The Admin Promotions & Campaigns Management Tool is a comprehensive system for creating and managing various types of promotional campaigns to boost user engagement and drive sales. This tool consolidates four major promotion types into a single, easy-to-use interface.

---

## 🎯 Features

### **1. Points Multiplier Campaigns**
Multiply points earned during specific periods to encourage participation.

### **2. Welcome Bonuses**
Automatically award points to new users during promotional periods.

### **3. Sales & Discounts**
Create discount campaigns for shop products.

### **4. Point Giveaways**
Award bonus points to users for special occasions or achievements.

---

## 🚀 Getting Started

### **Access the Promotions Tool**

1. Log in as an admin user
2. Navigate to **Admin Panel** (`/admin`)
3. Click the **"Promotions"** button in the header
4. Or go directly to `/admin/promotions`

---

## 📊 Tab 1: Points Multiplier Campaigns

### **What It Does**
Multiplies points earned during specific periods to encourage user participation in events and activities.

### **Use Cases**
- **Double Points Weekend** - 2x points for all activities
- **Holiday Bonus** - 1.5x points during holidays
- **Event Boost** - 3x points for event attendance
- **Volunteer Appreciation** - 2x points for volunteer work

### **How to Create a Multiplier Campaign**

1. Click **"Create Campaign"** button
2. Fill in the form:
   - **Campaign Name** - e.g., "Double Points Weekend"
   - **Description** - Explain the campaign
   - **Multiplier** - Enter value (e.g., 2.0 for double points)
   - **Start Date** - When campaign begins
   - **End Date** - When campaign ends
   - **Applicable Categories** - Select which activities get multiplied:
     - Event Attendance
     - Volunteer Work
     - Event Hosting
     - Contribution
   - **Active** - Toggle to activate/deactivate
3. Click **"Create Campaign"**

### **Campaign Details**

Each campaign card shows:
- **Status Badge** - "Active Now" (green) or "Inactive" (gray)
- **Multiplier Value** - e.g., "2.0x"
- **Date Range** - Start and end dates
- **Categories** - Which activities are affected
- **Actions** - Edit, Activate/Deactivate, Delete

### **How It Works**

When a user earns points during an active campaign:
1. System checks if current date is within campaign dates
2. System checks if the points category matches campaign categories
3. If both match, points are multiplied by the campaign multiplier
4. User receives the multiplied amount

**Example:**
- User attends event (normally 50 points)
- "Double Points Weekend" is active (2.0x multiplier)
- User receives 100 points instead

---

## 🎁 Tab 2: Welcome Bonuses

### **What It Does**
Automatically awards points to new users when they sign up during a promotional period.

### **Use Cases**
- **First 100 Users** - Award 1500 points to first 100 signups
- **Launch Promotion** - Welcome bonus for early adopters
- **Referral Campaign** - Bonus points for new members
- **Seasonal Welcome** - Holiday welcome bonus

### **How to Create a Welcome Bonus**

1. Click **"Create Promotion"** button
2. Fill in the form:
   - **Promotion Name** - e.g., "First 100 Users Bonus"
   - **Description** - Explain the promotion
   - **Points Amount** - How many points to award (e.g., 1500)
   - **Max Users** - Maximum recipients (e.g., 100)
   - **Start Date** - When promotion begins
   - **End Date** - When promotion ends (optional)
   - **Active** - Toggle to activate/deactivate
3. Click **"Create Promotion"**

### **Promotion Details**

Each promotion card shows:
- **Status Badge** - "Active" or "Inactive"
- **Points Amount** - How many points awarded
- **Progress** - e.g., "45 / 100 users"
- **Date Range** - Start and end dates
- **Recipients** - View list of users who received points

### **How It Works**

When a new user signs up:
1. System checks if there's an active welcome promotion
2. System checks if user hasn't already received welcome points
3. System checks if promotion hasn't reached max users
4. If all checks pass, user receives points automatically
5. Promotion count increments

**Note:** Users can only receive welcome points once, even if multiple promotions are active.

---

## 💰 Tab 3: Sales & Discount Promotions

### **What It Does**
Creates discount campaigns for shop products to boost sales.

### **Use Cases**
- **Summer Sale** - 20% off all products
- **Black Friday** - $10 off orders over $50
- **Clearance Sale** - 50% off select items
- **Member Appreciation** - 15% off for active members

### **How to Create a Sale Promotion**

1. Click **"Create Sale"** button
2. Fill in the form:
   - **Promotion Name** - e.g., "Summer Sale 2025"
   - **Description** - Explain the sale
   - **Discount Type** - Percentage (%) or Fixed Amount ($)
   - **Discount Value** - Amount or percentage
   - **Start Date** - When sale begins
   - **End Date** - When sale ends
   - **Minimum Purchase** - Optional minimum order amount
   - **Max Discount** - Optional maximum discount cap
   - **Usage Limit** - Optional max number of uses
3. Click **"Create Promotion"**

### **Promotion Details**

Each promotion card shows:
- **Status Badge** - "Active Now" (green) or "Inactive" (gray)
- **Discount** - e.g., "20% off" or "$10.00 off"
- **Date Range** - Start and end dates
- **Usage** - e.g., "45 / 100" or "45 / ∞"
- **Conditions** - Min purchase, max discount

### **Discount Types**

**Percentage Discount:**
- Enter value between 0-100
- Example: 20% off = 20
- Applied to order total

**Fixed Amount Discount:**
- Enter dollar amount
- Example: $10 off = 10.00
- Subtracted from order total

### **Advanced Options**

**Minimum Purchase:**
- Require minimum order amount to qualify
- Example: $50 minimum for $10 off

**Max Discount:**
- Cap the maximum discount amount
- Example: 20% off, max $30 discount

**Usage Limit:**
- Limit total number of times promotion can be used
- Example: First 100 orders only

---

## 🎊 Tab 4: Point Giveaways

### **What It Does**
Awards bonus points to users for special occasions, achievements, or community events.

### **Use Cases**
- **Holiday Bonus** - 200 points to all active users
- **Anniversary Celebration** - 500 points to all members
- **Community Milestone** - Bonus for reaching 1000 members
- **Appreciation Day** - Thank you points for volunteers

### **How to Create a Point Giveaway**

1. Click **"Create Giveaway"** button
2. Fill in the form:
   - **Giveaway Name** - e.g., "Holiday Bonus Points"
   - **Description** - Explain the giveaway
   - **Points Amount** - How many points to award
   - **Category** - Points category for tracking
   - **Target Audience** - Who receives points:
     - **All Users** - Everyone
     - **Active Users** - Logged in last 30 days
     - **New Users** - Joined last 30 days
   - **Scheduled Date** - When to execute (if not immediate)
   - **Execute Now** - Award points immediately
3. Click **"Award Points Now"** or **"Schedule Giveaway"**

### **Giveaway Details**

Each giveaway card shows:
- **Status Badge** - "Executed" (purple) or "Scheduled" (gray)
- **Points Amount** - How many points awarded
- **Recipients** - Number of users who received points
- **Date** - Execution or scheduled date
- **Audience** - Target audience type

### **Target Audiences**

**All Users:**
- Every registered user receives points
- No restrictions

**Active Users:**
- Users who logged in within last 30 days
- Encourages continued engagement

**New Users:**
- Users who joined within last 30 days
- Welcomes new members

### **Execution Options**

**Execute Now:**
- Points awarded immediately
- Cannot be undone
- Confirmation recommended

**Schedule for Later:**
- Points awarded on scheduled date
- Requires manual execution or automation
- Can be edited before execution

---

## 📈 Best Practices

### **Points Multiplier Campaigns**

1. **Don't Stack Too Many** - Limit to 1-2 active campaigns at once
2. **Clear Communication** - Announce campaigns in advance
3. **Reasonable Multipliers** - 1.5x to 3.0x is ideal
4. **Limited Duration** - Weekend or week-long campaigns work best
5. **Track Results** - Monitor point inflation

### **Welcome Bonuses**

1. **Generous but Sustainable** - 1000-2000 points is good
2. **Limited Quantity** - First 50-100 users creates urgency
3. **Clear End Date** - Creates FOMO (fear of missing out)
4. **One-Time Only** - Prevent abuse with duplicate checks
5. **Promote Heavily** - Advertise to attract new users

### **Sales Promotions**

1. **Strategic Timing** - Holidays, events, slow periods
2. **Clear Terms** - Minimum purchase, max discount, etc.
3. **Limited Duration** - 1-2 weeks maximum
4. **Track ROI** - Monitor sales vs. discount cost
5. **Test Different Types** - Percentage vs. fixed amount

### **Point Giveaways**

1. **Special Occasions Only** - Don't overuse
2. **Meaningful Amounts** - 100-500 points typical
3. **Target Appropriately** - Reward the right audience
4. **Communicate Why** - Explain the reason
5. **Track Impact** - Monitor engagement after giveaway

---

## ⚠️ Important Notes

### **Points Inflation**
- Too many promotions can devalue points
- Monitor total points in circulation
- Adjust conversion rates if needed

### **Budget Impact**
- Sales promotions reduce revenue
- Calculate discount cost vs. volume increase
- Set max discount caps to control costs

### **User Expectations**
- Regular promotions create expectations
- Users may wait for sales before buying
- Balance frequency with urgency

### **Fairness**
- Ensure promotions are accessible to all
- Avoid favoritism or discrimination
- Clear, transparent rules

---

## 🔧 Technical Details

### **Database Collections**

- `points_multipliers` - Multiplier campaigns
- `welcome_points_promotions` - Welcome bonuses
- `welcome_points_recipients` - Bonus recipients
- `sales_promotions` - Sales campaigns
- `point_giveaways` - Point giveaway records

### **Permissions**

- **Admin Only** - All promotion management
- **President/Co-President** - Can view and create
- **Members** - Cannot access

### **Automation**

- Welcome bonuses: Automatic on signup
- Points multipliers: Automatic on point award
- Sales promotions: Manual application at checkout
- Point giveaways: Manual execution or scheduled

---

## 📞 Support

For questions or issues:
- Check this documentation first
- Contact system administrator
- Review Firebase console for errors
- Check browser console for client errors

---

**Created:** 2025-10-11  
**Version:** 1.0  
**Status:** Active

