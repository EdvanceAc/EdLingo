#!/usr/bin/env node

/**
 * Quick test script for verifying fixes
 */

const path = require('path');

async function testQuickFixes() {
  console.log('🧪 Testing Quick Fixes\n');
  
  // Test ServiceWrapper
  try {
    const ServiceWrapper = require('./src/utils/ServiceWrapper');
    console.log('✅ ServiceWrapper loaded successfully');
    
    // Test error message creation
    const errorMsg = ServiceWrapper.createUserFriendlyMessage('403 Forbidden', 'Test API');
    console.log('✅ Error message generation works:', errorMsg);
  } catch (error) {
    console.log('❌ ServiceWrapper test failed:', error.message);
  }
  
  // Test HealthMonitor
  try {
    const HealthMonitor = require('./src/utils/HealthMonitor');
    console.log('✅ HealthMonitor loaded successfully');
    
    // Register a mock service
    const mockService = {
      healthCheck: async () => ({ status: 'healthy', message: 'Mock service OK' })
    };
    
    HealthMonitor.registerService('mock', mockService);
    const results = await HealthMonitor.checkAllServices();
    console.log('✅ Health check works:', results.mock?.status);
  } catch (error) {
    console.log('❌ HealthMonitor test failed:', error.message);
  }
  
  console.log('\n🎯 Quick fixes test completed!');
}

testQuickFixes().catch(console.error);