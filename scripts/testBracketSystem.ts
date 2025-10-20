/**
 * Tournament Bracket System End-to-End Test
 * 
 * This script tests the tournament bracket system:
 * - Bracket generation (single and double elimination)
 * - Match updates
 * - Winner progression
 * - Bracket completion
 * 
 * Usage:
 *   npx tsx scripts/testBracketSystem.ts
 */

import { BracketGenerator } from '../src/lib/bracketGenerator';
import { BracketMatch, TournamentBracket } from '../src/types/bracket';

// Test results tracking
interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

const testResults: TestResult[] = [];

function logTest(testName: string, passed: boolean, message: string, details?: any) {
  testResults.push({ testName, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${testName}: ${message}`);
  if (details) {
    console.log(`   Details:`, JSON.stringify(details, null, 2));
  }
}

/**
 * Test 1: Single Elimination Bracket Generation
 */
function testSingleEliminationGeneration() {
  console.log('\n🏆 Test 1: Single Elimination Bracket Generation');
  console.log('='.repeat(60));
  
  const participants = ['player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'];
  const tournamentId = 'test_tournament_1';
  
  const matches = BracketGenerator.generateSingleElimination({
    participants,
    tournamentId,
    randomizeSeeding: false,
  });
  
  // Test: Correct number of matches (8 players = 7 matches total)
  const expectedMatches = participants.length - 1;
  logTest('Single Elimination Match Count', matches.length === expectedMatches,
    matches.length === expectedMatches ? `Generated ${matches.length} matches` : `Expected ${expectedMatches}, got ${matches.length}`,
    { expected: expectedMatches, actual: matches.length }
  );
  
  // Test: First round has 4 matches
  const firstRoundMatches = matches.filter(m => m.round === 1);
  logTest('First Round Match Count', firstRoundMatches.length === 4,
    firstRoundMatches.length === 4 ? 'First round has 4 matches' : `Expected 4, got ${firstRoundMatches.length}`
  );
  
  // Test: All first round matches have both players
  const allHavePlayers = firstRoundMatches.every(m => m.player1Id && m.player2Id);
  logTest('First Round Players Assigned', allHavePlayers,
    allHavePlayers ? 'All first round matches have players' : 'Some matches missing players'
  );
  
  // Test: Matches have correct tournament ID
  const correctTournamentId = matches.every(m => m.tournamentId === tournamentId);
  logTest('Tournament ID Correct', correctTournamentId,
    correctTournamentId ? 'All matches have correct tournament ID' : 'Some matches have wrong tournament ID'
  );
  
  // Test: Matches have unique IDs
  const uniqueIds = new Set(matches.map(m => m.id)).size === matches.length;
  logTest('Unique Match IDs', uniqueIds,
    uniqueIds ? 'All matches have unique IDs' : 'Duplicate match IDs found'
  );
}

/**
 * Test 2: Double Elimination Bracket Generation
 */
function testDoubleEliminationGeneration() {
  console.log('\n🏆 Test 2: Double Elimination Bracket Generation');
  console.log('='.repeat(60));
  
  const participants = ['player1', 'player2', 'player3', 'player4'];
  const tournamentId = 'test_tournament_2';
  
  const matches = BracketGenerator.generateDoubleElimination({
    participants,
    tournamentId,
    randomizeSeeding: false,
  });
  
  // Test: Has both winners and losers bracket matches
  const winnersMatches = matches.filter(m => m.bracket === 'winners');
  const losersMatches = matches.filter(m => m.bracket === 'losers');
  const grandFinalMatches = matches.filter(m => m.bracket === 'grand_final');
  
  logTest('Winners Bracket Exists', winnersMatches.length > 0,
    winnersMatches.length > 0 ? `${winnersMatches.length} winners bracket matches` : 'No winners bracket matches'
  );
  
  logTest('Losers Bracket Exists', losersMatches.length > 0,
    losersMatches.length > 0 ? `${losersMatches.length} losers bracket matches` : 'No losers bracket matches'
  );
  
  logTest('Grand Final Exists', grandFinalMatches.length === 1,
    grandFinalMatches.length === 1 ? 'Grand final match created' : 'Grand final missing or duplicated'
  );
  
  // Test: Total matches is correct (for 4 players: 3 winners + 2 losers + 1 grand final = 6)
  const expectedTotal = 6;
  logTest('Double Elimination Total Matches', matches.length === expectedTotal,
    matches.length === expectedTotal ? `${matches.length} total matches` : `Expected ${expectedTotal}, got ${matches.length}`,
    { expected: expectedTotal, actual: matches.length }
  );
}

/**
 * Test 3: Bracket with Byes (Non-Power-of-2 Participants)
 */
function testBracketWithByes() {
  console.log('\n🏆 Test 3: Bracket with Byes (5 participants)');
  console.log('='.repeat(60));
  
  const participants = ['player1', 'player2', 'player3', 'player4', 'player5'];
  const tournamentId = 'test_tournament_3';
  
  const matches = BracketGenerator.generateSingleElimination({
    participants,
    tournamentId,
    randomizeSeeding: false,
  });
  
  // Test: Padded to next power of 2 (8 players = 7 matches)
  const expectedMatches = 7;
  logTest('Bye Padding Correct', matches.length === expectedMatches,
    matches.length === expectedMatches ? 'Padded to 8 players (7 matches)' : `Expected ${expectedMatches}, got ${matches.length}`
  );
  
  // Test: Some first round matches have byes (completed with winner)
  const firstRoundMatches = matches.filter(m => m.round === 1);
  const byeMatches = firstRoundMatches.filter(m => m.status === 'completed' && m.winnerId);
  
  logTest('Bye Matches Created', byeMatches.length > 0,
    byeMatches.length > 0 ? `${byeMatches.length} bye matches auto-completed` : 'No bye matches found'
  );
}

/**
 * Test 4: Match Progression Logic
 */
function testMatchProgression() {
  console.log('\n🏆 Test 4: Match Progression Logic');
  console.log('='.repeat(60));
  
  const participants = ['player1', 'player2', 'player3', 'player4'];
  const tournamentId = 'test_tournament_4';
  
  const matches = BracketGenerator.generateSingleElimination({
    participants,
    tournamentId,
    randomizeSeeding: false,
  });
  
  // Test: First round matches have nextMatchId
  const firstRoundMatches = matches.filter(m => m.round === 1);
  const hasNextMatch = firstRoundMatches.every(m => m.nextMatchId);
  
  logTest('Next Match IDs Set', hasNextMatch,
    hasNextMatch ? 'All first round matches have nextMatchId' : 'Some matches missing nextMatchId'
  );
  
  // Test: Final match has no nextMatchId
  const finalMatch = matches.find(m => m.round === Math.max(...matches.map(m => m.round)));
  logTest('Final Match No Next', !finalMatch?.nextMatchId,
    !finalMatch?.nextMatchId ? 'Final match has no nextMatchId' : 'Final match should not have nextMatchId'
  );
}

/**
 * Test 5: Randomized Seeding
 */
function testRandomizedSeeding() {
  console.log('\n🏆 Test 5: Randomized Seeding');
  console.log('='.repeat(60));
  
  const participants = ['player1', 'player2', 'player3', 'player4'];
  const tournamentId = 'test_tournament_5';
  
  const matches1 = BracketGenerator.generateSingleElimination({
    participants,
    tournamentId,
    randomizeSeeding: true,
  });
  
  const matches2 = BracketGenerator.generateSingleElimination({
    participants,
    tournamentId,
    randomizeSeeding: true,
  });
  
  // Test: Two randomized brackets are different
  const firstMatch1 = matches1.find(m => m.round === 1 && m.matchNumber === 1);
  const firstMatch2 = matches2.find(m => m.round === 1 && m.matchNumber === 1);
  
  const isDifferent = firstMatch1?.player1Id !== firstMatch2?.player1Id || 
                      firstMatch1?.player2Id !== firstMatch2?.player2Id;
  
  logTest('Randomization Works', isDifferent,
    isDifferent ? 'Randomized seeding produces different brackets' : 'Randomization may not be working (could be coincidence)',
    { 
      bracket1: `${firstMatch1?.player1Id} vs ${firstMatch1?.player2Id}`,
      bracket2: `${firstMatch2?.player1Id} vs ${firstMatch2?.player2Id}`
    }
  );
}

/**
 * Test 6: Bracket Data Structure
 */
function testBracketDataStructure() {
  console.log('\n🏆 Test 6: Bracket Data Structure');
  console.log('='.repeat(60));
  
  const participants = ['player1', 'player2', 'player3', 'player4'];
  const tournamentId = 'test_tournament_6';
  
  const matches = BracketGenerator.generateSingleElimination({
    participants,
    tournamentId,
    randomizeSeeding: false,
  });
  
  // Test: All matches have required fields
  const requiredFields = ['id', 'tournamentId', 'round', 'matchNumber', 'bracket', 'status', 'createdAt'];
  const allHaveRequiredFields = matches.every(m => 
    requiredFields.every(field => field in m)
  );
  
  logTest('Required Fields Present', allHaveRequiredFields,
    allHaveRequiredFields ? 'All matches have required fields' : 'Some matches missing required fields'
  );
  
  // Test: Status is valid
  const validStatuses = ['pending', 'in_progress', 'completed'];
  const allHaveValidStatus = matches.every(m => validStatuses.includes(m.status));
  
  logTest('Valid Status Values', allHaveValidStatus,
    allHaveValidStatus ? 'All matches have valid status' : 'Some matches have invalid status'
  );
  
  // Test: Bracket type is valid
  const validBrackets = ['winners', 'losers', 'grand_final'];
  const allHaveValidBracket = matches.every(m => validBrackets.includes(m.bracket));
  
  logTest('Valid Bracket Types', allHaveValidBracket,
    allHaveValidBracket ? 'All matches have valid bracket type' : 'Some matches have invalid bracket type'
  );
}

/**
 * Main test runner
 */
function runTests() {
  console.log('\n🧪 Tournament Bracket System Test Suite');
  console.log('='.repeat(60));
  console.log('Testing bracket generation and match progression...\n');
  
  testSingleEliminationGeneration();
  testDoubleEliminationGeneration();
  testBracketWithByes();
  testMatchProgression();
  testRandomizedSeeding();
  testBracketDataStructure();
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const total = testResults.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.testName}: ${r.message}`);
    });
  }
  
  console.log('\n✨ Test suite completed!');
  console.log('\n📝 Note: This tests bracket generation logic only.');
  console.log('   For full end-to-end testing, use the admin UI to:');
  console.log('   1. Create a tournament');
  console.log('   2. Generate a bracket');
  console.log('   3. Update match results');
  console.log('   4. View public bracket display');
  console.log('   5. Verify real-time updates');
  
  return failed === 0;
}

// Run tests
const success = runTests();
process.exit(success ? 0 : 1);

