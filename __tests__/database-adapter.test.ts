import { createTaskAdapter } from '../src/lib/database-adapter/factory';

async function testAdapter() {
  console.log('🧪 Testing Database Adapter...');
  
  try {
    const adapter = await createTaskAdapter();
    console.log('✅ Adapter created successfully');
    
    // Test create operation
    console.log('📝 Testing create operation...');
    const newTask = await adapter.create({
      code: 'TEST-001',
      title: 'Test Task from Adapter',
      status: 'todo',
      label: 'bug',
      priority: 'high',
    });
    console.log('✅ Task created:', newTask.id, newTask.title);
    
    // Test findMany operation
    console.log('🔍 Testing findMany operation...');
    const result = await adapter.findManyWithCount({
      filters: [],
      sorts: [{ id: 'createdAt', desc: true }],
      limit: 10,
      offset: 0,
      joinOperator: 'and',
    });
    console.log('✅ Found', result.total, 'tasks, showing', result.data.length);
    
    // Test filtering
    console.log('🔎 Testing filtering operation...');
    const filteredResult = await adapter.findManyWithCount({
      filters: [{
        id: 'priority',
        operator: 'eq',
        value: 'high',
        variant: 'select',
        filterId: 'priority-filter'
      }],
      sorts: [],
      limit: 10,
      offset: 0,
      joinOperator: 'and',
    });
    console.log('✅ Found', filteredResult.total, 'high priority tasks');
    
    // Test aggregation
    console.log('📊 Testing aggregation operation...');
    const statusCounts = await adapter.aggregate({
      filters: [],
      joinOperator: 'and',
      groupBy: ['status'],
      aggregates: {
        status: { count: true },
      },
    });
    console.log('✅ Status counts:', statusCounts);
    
    // Test update
    console.log('✏️ Testing update operation...');
    const updatedTask = await adapter.update(newTask.id, {
      title: 'Updated Test Task',
      priority: 'medium',
    });
    console.log('✅ Task updated:', updatedTask.title, updatedTask.priority);
    
    // Test delete
    console.log('🗑️ Testing delete operation...');
    await adapter.delete(newTask.id);
    console.log('✅ Task deleted');
    
    console.log('🎉 All adapter tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
    console.error((error as Error).stack);
  }
  
  process.exit(0);
}

testAdapter();