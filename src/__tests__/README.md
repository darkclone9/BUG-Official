# Store Credit System Tests

This directory contains unit tests for the store credit system.

## Running Tests

To run all tests:

```bash
npx tsx src/__tests__/storeCredit.test.ts
```

## Test Coverage

### ✅ Store Credit Business Logic Tests (`storeCredit.test.ts`)

**Total Tests: 48 | Success Rate: 100%**

#### Utility Functions (10 tests)
- ✅ `formatCentsToDollars()` - Format cents to dollar strings
- ✅ `dollarsToCents()` - Convert dollars to cents
- ✅ `centsToDollars()` - Convert cents to dollars

#### Discount Calculations (12 tests)
- ✅ `calculateItemMaxDiscount()` - Per-item discount cap (50%)
- ✅ `calculateItemMaxDiscount()` - Available credit limit
- ✅ `calculateStoreCreditDiscount()` - Valid discount calculation
- ✅ `calculateStoreCreditDiscount()` - Insufficient credit validation
- ✅ `calculateStoreCreditDiscount()` - Per-order cap enforcement ($30)
- ✅ `calculateStoreCreditDiscount()` - No eligible items validation
- ✅ `applyStoreCreditToOrder()` - Apply discount to order
- ✅ `applyStoreCreditToOrder()` - Never go below $0

#### Transaction Validation (4 tests)
- ✅ `validateStoreCreditTransaction()` - Valid transaction
- ✅ `validateStoreCreditTransaction()` - Negative amounts (spending)
- ✅ `validateStoreCreditTransaction()` - Monthly cap exceeded

#### Monthly Cap Logic (6 tests)
- ✅ `checkMonthlyEarningCap()` - Under cap
- ✅ `checkMonthlyEarningCap()` - At cap
- ✅ `checkMonthlyEarningCap()` - Partial amount allowed
- ✅ `shouldResetMonthlyCap()` - Same month (no reset)
- ✅ `shouldResetMonthlyCap()` - Different month (reset)

#### Multiplier Logic (8 tests)
- ✅ `applyMultiplier()` - Matching category (2x multiplier)
- ✅ `applyMultiplier()` - Non-matching category
- ✅ `applyMultiplier()` - Inactive multiplier
- ✅ `applyMultiplier()` - Expired multiplier
- ✅ `applyMultiplier()` - Multiple multipliers (highest wins)

#### Edge Cases (6 tests)
- ✅ Zero discount amounts
- ✅ Very large amounts
- ✅ Multiple items with mixed eligibility
- ✅ Per-order cap enforcement on large orders

## Test Configuration

Default test settings:
```typescript
{
  perItemDiscountCap: 50,        // 50% max per item
  perOrderDiscountCap: 3000,     // $30.00 max per order
  monthlyEarningCap: 5000,       // $50.00 max per month
  earningValues: {
    eventAttendance: 100,        // $1.00
    volunteerWork: 250,          // $2.50
    eventHosting: 500,           // $5.00
    contributionMin: 50,         // $0.50
    contributionMax: 150,        // $1.50
  }
}
```

## Adding New Tests

To add new tests to `storeCredit.test.ts`:

1. Add test cases in the appropriate section
2. Use `assert()` for boolean checks
3. Use `assertEquals()` for value comparisons
4. Run tests to verify they pass

Example:
```typescript
// Test new feature
const result = myNewFunction(input);
assert(result.isValid, 'Result should be valid');
assertEquals(result.value, expectedValue, 'Value should match expected');
```

## Future Test Files

Planned test files:
- `database.test.ts` - Database function tests (requires Firebase emulator)
- `components.test.ts` - Component tests (requires React testing library)
- `integration.test.ts` - End-to-end integration tests

## Notes

- Tests use `tsx` to run TypeScript directly without compilation
- No testing framework (Jest/Vitest) is currently installed
- Tests are self-contained and don't require external dependencies
- All tests must pass before deploying to production

