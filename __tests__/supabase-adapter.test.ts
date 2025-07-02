import { createTaskAdapter } from '../src/lib/database-adapter/factory';

async function testSupabaseAdapter() {
  console.log('🧪 Testing Supabase Adapter...');
  
  try {
    const adapter = await createTaskAdapter('supabase');
    console.log('✅ Supabase adapter created successfully');
    
    // Test create operation
    console.log('📝 Testing create operation...');
    const newTask = await adapter.create({
      code: `SUPABASE-TEST-${Date.now()}`,
      title: 'Supabase Test Task',
      status: 'todo',
      label: 'feature',
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
    
    // Test text search
    console.log('🔤 Testing text search...');
    const searchResult = await adapter.findManyWithCount({
      filters: [{
        id: 'title',
        operator: 'iLike',
        value: 'test',
        variant: 'text',
        filterId: 'title-filter'
      }],
      sorts: [],
      limit: 10,
      offset: 0,
      joinOperator: 'and',
    });
    console.log('✅ Found', searchResult.total, 'tasks with "test" in title');
    
    // Test update
    console.log('✏️ Testing update operation...');
    const updatedTask = await adapter.update(newTask.id, {
      title: 'Updated Supabase Test Task',
      priority: 'medium',
    });
    console.log('✅ Task updated:', updatedTask.title, updatedTask.priority);
    
    // Test count
    console.log('🔢 Testing count operation...');
    const totalCount = await adapter.count({
      filters: [],
      joinOperator: 'and',
    });
    console.log('✅ Total tasks count:', totalCount);
    
    // Test findFirst
    console.log('🎯 Testing findFirst operation...');
    const firstTask = await adapter.findFirst({
      filters: [{
        id: 'status',
        operator: 'eq',
        value: 'todo',
        variant: 'select',
        filterId: 'status-filter'
      }],
      sorts: [{ id: 'createdAt', desc: true }],
      joinOperator: 'and',
    });
    console.log('✅ Found first todo task:', firstTask?.title);
    
    // Test inArray filtering
    console.log('📋 Testing inArray filtering...');
    const inArrayResult = await adapter.findManyWithCount({
      filters: [{
        id: 'label',
        operator: 'inArray',
        value: ['bug', 'feature'],
        variant: 'multiSelect',
        filterId: 'label-filter'
      }],
      sorts: [],
      limit: 5,
      offset: 0,
      joinOperator: 'and',
    });
    console.log('✅ Found', inArrayResult.total, 'tasks with bug or feature labels');
    
    // Test date range filtering
    console.log('📅 Testing date range filtering...');
    const startDate = 1743307200000; // Unix timestamp in milliseconds
    const endDate = 1756526400000;   // Later Unix timestamp
    
    console.log(`  Start: ${new Date(startDate).toISOString()}`);
    console.log(`  End: ${new Date(endDate).toISOString()}`);
    
    const dateRangeResult = await adapter.findManyWithCount({
      filters: [{
        id: 'createdAt',
        operator: 'isBetween',
        value: [startDate.toString(), endDate.toString()],
        variant: 'dateRange',
        filterId: 'created-at-filter'
      }],
      sorts: [{ id: 'createdAt', desc: true }],
      limit: 10,
      offset: 0,
      joinOperator: 'and',
    });
    console.log('✅ Date range filter completed - found', dateRangeResult.total, 'tasks in range');
    
    // Test delete
    console.log('🗑️ Testing delete operation...');
    await adapter.delete(newTask.id);
    console.log('✅ Task deleted');
    
    // Verify deletion
    const deletedTask = await adapter.findFirst({
      filters: [{
        id: 'id',
        operator: 'eq',
        value: newTask.id,
        variant: 'text',
        filterId: 'id-filter'
      }],
      sorts: [],
      joinOperator: 'and',
    });
    
    console.assert(deletedTask === null, 'Task should be deleted');
    console.log('✅ Deletion verified');
    
    console.log('🎉 All Supabase adapter tests passed!');
    
  } catch (error) {
    console.error('❌ Supabase adapter test failed:', (error as Error).message);
    console.error((error as Error).stack);
    throw error;
  }
}

testSupabaseAdapter()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Supabase adapter tests failed:', error);
    process.exit(1);
  });