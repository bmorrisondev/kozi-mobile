import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createSupabaseClerkClient } from '@/utils/supabase';
import { useOrganization, useSession, useUser } from '@clerk/clerk-expo';

interface Task {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
}

function TaskItem({ task, onToggleComplete, onDelete }: TaskItemProps) {
  return (
    <ThemedView style={styles.taskItem}>
      <TouchableOpacity 
        style={[styles.checkbox, task.is_completed && styles.checkboxChecked]}
        onPress={() => onToggleComplete(task.id, !task.is_completed)}
      />
      <ThemedView style={styles.taskContent}>
        <ThemedText 
          type={task.is_completed ? "defaultSemiBold" : "default"}
          style={task.is_completed ? styles.completedText : undefined}
        >
          {task.title}
        </ThemedText>
        {task.description && (
          <ThemedText style={[styles.description, task.is_completed && styles.completedText]}>
            {task.description}
          </ThemedText>
        )}
      </ThemedView>
      <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteButton}>
        <ThemedText style={styles.deleteText}>×</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const { session } = useSession()
  const { user } = useUser() 
  const { organization } = useOrganization()
  const supabase = createSupabaseClerkClient(session?.getToken() || Promise.resolve(null));

  const ownerId = organization?.id || user?.id

  async function fetchTasks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addTask() {
    if (!newTaskTitle.trim()) return;

    const token = await session?.getToken()
    console.log(organization?.id, user?.id, token)

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ title: newTaskTitle.trim(), ownerid: organization?.id || user?.id }])
        .select();

      if (error) {
        console.error('Error adding task:', error);
        return;
      }

      if (data) {
        setTasks([...data, ...tasks]);
        setNewTaskTitle('');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }

  async function toggleTaskCompletion(id: string, isCompleted: boolean) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: isCompleted, ownerid: organization?.id || user?.id })
        .eq('id', id);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      setTasks(tasks.map(task => 
        task.id === id ? { ...task, is_completed: isCompleted } : task
      ));
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }

  async function deleteTask(id: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('ownerid', organization?.id || user?.id);

      if (error) {
        console.error('Error deleting task:', error);
        return;
      }

      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }

  useEffect(() => {
    fetchTasks();

    const subscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [ownerId]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Todo List</ThemedText>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <ThemedText style={styles.addButtonText}>+</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.tasksContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#A1CEDC" style={styles.loader} />
        ) : tasks.length === 0 ? (
          <ThemedText style={styles.emptyText}>No tasks yet. Add one above!</ThemedText>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem 
                task={item} 
                onToggleComplete={toggleTaskCompletion} 
                onDelete={deleteTask} 
              />
            )}
            scrollEnabled={false}
          />
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#A1CEDC',
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  tasksContainer: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A1CEDC',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#A1CEDC',
  },
  taskContent: {
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 5,
  },
  deleteText: {
    fontSize: 24,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
