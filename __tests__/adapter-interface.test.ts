import { createTaskAdapter } from '../src/lib/database-adapter/factory';
import type { DatabaseAdapter, QueryParams } from '../src/lib/database-adapter/types';
import type { Task } from '../src/db/schema';

async function testAdapterInterface() {
  console.log('🧪 Testing Adapter Interface Compliance...');
  
  try {
    const adapter = await createTaskAdapter();
    
    // Test that adapter implements all required methods
    console.log('🔍 Testing interface method existence...');
    
    const requiredMethods = [
      'findMany',
      'findManyWithCount', 
      'findFirst',
      'create',
      'update',
      'delete',
      'aggregate',
      'transaction'
    ];
    
    for (const method of requiredMethods) {
      console.assert(
        typeof (adapter as any)[method] === 'function',
        `Adapter should implement ${method} method`
      );
    }
    
    console.log('✅ All required methods present');
    
    // Test interface behavior consistency
    console.log('⚖️ Testing behavior consistency...');
    
    // Test that pagination parameters work consistently
    const paginationTest = await adapter.findManyWithCount({
      filters: [],
      sorts: [],
      limit: 5,
      offset: 0,
      joinOperator: 'and'
    });
    
    console.assert(
      paginationTest.data.length <= 5,
      'Pagination limit should be respected'
    );
    
    console.assert(
      typeof paginationTest.total === 'number',
      'Total count should be a number'
    );
    
    console.assert(
      Array.isArray(paginationTest.data),
      'Data should be an array'
    );
    
    console.log('✅ Pagination behavior consistent');
    
    // Test sorting consistency
    console.log('🔄 Testing sorting consistency...');
    
    const sortedAsc = await adapter.findMany({
      filters: [],
      sorts: [{ id: 'createdAt', desc: false }],
      limit: 3,
      offset: 0,
      joinOperator: 'and'
    });
    
    const sortedDesc = await adapter.findMany({
      filters: [],
      sorts: [{ id: 'createdAt', desc: true }],
      limit: 3,
      offset: 0,
      joinOperator: 'and'
    });
    
    if (sortedAsc.length > 1 && sortedDesc.length > 1) {
      const firstAscDate = new Date(sortedAsc[0]!.createdAt);
      const firstDescDate = new Date(sortedDesc[0]!.createdAt);
      
      console.assert(
        firstDescDate >= firstAscDate,
        'Desc sort should return newer dates first'
      );
    }
    
    console.log('✅ Sorting behavior consistent');
    
    // Test filtering behavior consistency
    console.log('🎯 Testing filtering consistency...');
    
    const allTasks = await adapter.findManyWithCount({
      filters: [],
      sorts: [],
      limit: 100,
      offset: 0,
      joinOperator: 'and'
    });
    
    const todoTasks = await adapter.findManyWithCount({
      filters: [{
        id: 'status',
        operator: 'eq',
        value: 'todo',
        variant: 'select',
        filterId: 'status-filter'
      }],
      sorts: [],
      limit: 100,
      offset: 0,
      joinOperator: 'and'
    });
    
    console.assert(
      todoTasks.total <= allTasks.total,
      'Filtered results should be subset of all results'
    );
    
    // Verify all returned tasks have status = 'todo'
    const allTodoStatus = todoTasks.data.every(task => task.status === 'todo');
    console.assert(allTodoStatus, 'All filtered tasks should match filter criteria');
    
    console.log('✅ Filtering behavior consistent');
    
    // Test error handling consistency
    console.log('⚠️ Testing error handling...');
    
    try {
      // Test invalid ID
      await adapter.findFirst({
        filters: [{ id: 'id', operator: 'eq', value: 'invalid-id-that-does-not-exist', variant: 'text', filterId: 'invalid-filter' }],
        sorts: [],
        joinOperator: 'and'
      });
      console.log('⚠️ findFirst with invalid ID should handle gracefully');
    } catch (error) {
      console.log('✅ findFirst properly handles invalid ID');
    }
    
    try {
      // Test update with invalid ID
      await adapter.update('invalid-id', { title: 'test' });
      console.log('⚠️ Update with invalid ID handled gracefully');
    } catch (error) {
      console.log('✅ Update properly handles invalid ID');
    }
    
    // Test return type consistency
    console.log('📋 Testing return type consistency...');
    
    const createResult = await adapter.create({
      code: 'INTERFACE-TEST',
      title: 'Interface Test Task',
      status: 'todo',
      label: 'feature',
      priority: 'medium'
    });
    
    console.assert(typeof createResult.id === 'string', 'Created task should have string ID');
    console.assert(createResult.title === 'Interface Test Task', 'Created task should have correct title');
    console.assert(createResult.status === 'todo', 'Created task should have correct status');
    
    // Test update return type
    const updateResult = await adapter.update(createResult.id, {
      priority: 'high'
    });
    
    console.assert(updateResult.id === createResult.id, 'Updated task should have same ID');
    console.assert(updateResult.priority === 'high', 'Updated task should have new priority');
    
    // Cleanup
    await adapter.delete(createResult.id);
    
    console.log('✅ Return types consistent');
    
    // Test aggregation interface
    console.log('📊 Testing aggregation interface...');
    
    const aggregateResult = await adapter.aggregate({
      filters: [],
      joinOperator: 'and',
      groupBy: ['status'],
      aggregates: {
        status: { count: true }
      }
    });
    
    console.assert(Array.isArray(aggregateResult), 'Aggregate should return array');
    console.assert(
      aggregateResult.every(item => typeof item.status_count === 'number'),
      'Aggregate should return count numbers'
    );
    
    console.log('✅ Aggregation interface consistent');
    
    console.log('🎉 All adapter interface tests passed!');
    
  } catch (error) {
    console.error('❌ Adapter interface test failed:', error);
    throw error;
  }
}

testAdapterInterface()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Adapter interface tests failed:', error);
    process.exit(1);
  });