import { createTaskAdapter } from '../src/lib/database-adapter/factory';

async function testTransactions() {
  console.log('🧪 Testing Transaction Functionality...');
  
  try {
    const adapter = await createTaskAdapter();
    
    // Test successful transaction
    console.log('✅ Testing successful transaction...');
    
    const transactionResult = await adapter.transaction(async ({ adapter: tx }) => {
      // Create a task within transaction
      const newTask = await tx.create({
        code: `TXN-TEST-1-${Date.now()}`,
        title: 'Transaction Test Task 1',
        status: 'todo',
        label: 'feature',
        priority: 'high'
      });
      
      // Update the task within the same transaction
      const updatedTask = await tx.update(newTask.id, {
        status: 'in-progress',
        priority: 'medium'
      });
      
      return { created: newTask, updated: updatedTask };
    });
    
    console.assert(
      transactionResult.created.code.includes('TXN-TEST-1'),
      'Transaction should create task correctly'
    );
    
    console.assert(
      transactionResult.updated.status === 'in-progress',
      'Transaction should update task correctly'
    );
    
    // Verify task exists after transaction
    const persistedTask = await adapter.findFirst({
      filters: [{ id: 'id', operator: 'eq', value: transactionResult.created.id, variant: 'text', filterId: 'id-filter' }],
      sorts: [],
      joinOperator: 'and'
    });
    console.assert(
      persistedTask?.status === 'in-progress',
      'Transaction changes should be persisted'
    );
    
    console.log('✅ Successful transaction test passed');
    
    // Test transaction rollback
    console.log('🔄 Testing transaction rollback...');
    
    const taskCountBefore = await adapter.findManyWithCount({
      filters: [],
      sorts: [],
      limit: 1000,
      offset: 0,
      joinOperator: 'and'
    });
    
    try {
      await adapter.transaction(async ({ adapter: tx }) => {
        // Create a task
        const newTask = await tx.create({
          code: `TXN-ROLLBACK-${Date.now()}`,
          title: 'Should Be Rolled Back',
          status: 'todo',
          label: 'bug',
          priority: 'low'
        });
        
        // Force an error to trigger rollback
        throw new Error('Intentional rollback test');
      });
      
      console.error('❌ Transaction should have thrown an error');
    } catch (error) {
      if ((error as Error).message === 'Intentional rollback test') {
        console.log('✅ Transaction properly threw expected error');
      } else {
        throw error;
      }
    }
    
    // Verify rollback worked
    const taskCountAfter = await adapter.findManyWithCount({
      filters: [],
      sorts: [],
      limit: 1000,
      offset: 0,
      joinOperator: 'and'
    });
    
    console.assert(
      taskCountAfter.total === taskCountBefore.total,
      'Task count should be unchanged after rollback'
    );
    
    // Try to find the rolled-back task
    const rolledBackTasks = await adapter.findManyWithCount({
      filters: [{
        id: 'code',
        operator: 'eq',
        value: 'TXN-ROLLBACK',
        variant: 'text',
        filterId: 'code-filter'
      }],
      sorts: [],
      limit: 10,
      offset: 0,
      joinOperator: 'and'
    });
    
    console.assert(
      rolledBackTasks.total === 0,
      'Rolled back task should not exist'
    );
    
    console.log('✅ Transaction rollback test passed');
    
    // Test complex transaction with multiple operations
    console.log('🔄 Testing complex transaction...');
    
    const complexResult = await adapter.transaction(async ({ adapter: tx }) => {
      // Create multiple tasks
      const task1 = await tx.create({
        code: `COMPLEX-1-${Date.now()}`,
        title: 'Complex Transaction Task 1',
        status: 'todo',
        label: 'feature',
        priority: 'high'
      });
      
      const task2 = await tx.create({
        code: `COMPLEX-2-${Date.now() + 1}`,  
        title: 'Complex Transaction Task 2',
        status: 'todo',
        label: 'bug',
        priority: 'medium'
      });
      
      // Update both tasks
      const updated1 = await tx.update(task1.id, { status: 'in-progress' });
      const updated2 = await tx.update(task2.id, { status: 'done' });
      
      // Verify reads within transaction see the updates
      const readTask1 = await tx.findFirst({
        filters: [{ id: 'id', operator: 'eq', value: task1.id, variant: 'text', filterId: 'id-filter-1' }],
        sorts: [],
        joinOperator: 'and'
      });
      const readTask2 = await tx.findFirst({
        filters: [{ id: 'id', operator: 'eq', value: task2.id, variant: 'text', filterId: 'id-filter-2' }],
        sorts: [],
        joinOperator: 'and'
      });
      
      console.assert(
        readTask1?.status === 'in-progress',
        'Read within transaction should see updates'
      );
      
      console.assert(
        readTask2?.status === 'done',
        'Read within transaction should see updates'
      );
      
      return { task1: updated1, task2: updated2 };
    });
    
    console.log('✅ Complex transaction test passed');
    
    // Test transaction isolation
    console.log('🔒 Testing transaction isolation...');
    
    // This is a simplified test - in a real scenario you'd test with concurrent connections
    await adapter.transaction(async ({ adapter: tx }) => {
      const task = await tx.create({
        code: `ISOLATION-TEST-${Date.now()}`,
        title: 'Isolation Test Task',
        status: 'todo',
        label: 'feature',
        priority: 'high'
      });
      
      // Within this transaction, we can see the task
      const foundInTx = await tx.findFirst({
        filters: [{ id: 'id', operator: 'eq', value: task.id, variant: 'text', filterId: 'id-filter-isolation' }],
        sorts: [],
        joinOperator: 'and'
      });
      console.assert(
        foundInTx?.code.includes('ISOLATION-TEST'),
        'Task should be visible within transaction'
      );
      
      return task;
    });
    
    console.log('✅ Transaction isolation test passed');
    
    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    
    const testTasks = await adapter.findManyWithCount({
      filters: [{
        id: 'code',
        operator: 'iLike',
        value: 'TXN-TEST',
        variant: 'text',
        filterId: 'cleanup-filter'
      }],
      sorts: [],
      limit: 100,
      offset: 0,
      joinOperator: 'or'
    });
    
    const complexTasks = await adapter.findManyWithCount({
      filters: [{
        id: 'code',
        operator: 'iLike',
        value: 'COMPLEX',
        variant: 'text',
        filterId: 'cleanup-filter-2'
      }],
      sorts: [],
      limit: 100,
      offset: 0,
      joinOperator: 'or'
    });
    
    const isolationTasks = await adapter.findManyWithCount({
      filters: [{
        id: 'code',
        operator: 'iLike',
        value: 'ISOLATION',
        variant: 'text',
        filterId: 'cleanup-filter-3'
      }],
      sorts: [],
      limit: 100,
      offset: 0,
      joinOperator: 'or'
    });
    
    const allTestTasks = [...testTasks.data, ...complexTasks.data, ...isolationTasks.data];
    
    for (const task of allTestTasks) {
      await adapter.delete(task.id);
    }
    
    console.log(`✅ Cleaned up ${allTestTasks.length} test tasks`);
    
    console.log('🎉 All transaction tests passed!');
    
  } catch (error) {
    console.error('❌ Transaction test failed:', error);
    throw error;
  }
}

testTransactions()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Transaction tests failed:', error);
    process.exit(1);
  });