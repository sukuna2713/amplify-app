import React, { useEffect, useState } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { createTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';

import type { ListTodosQuery, CreateTodoInput } from './API';

import awsExports from './aws-exports';
import type { GraphQLResult } from '@aws-amplify/api'
Amplify.configure(awsExports)

/**
 * フォームの状態
 */
type FormState = {
  name: string;
  description: string;
}

const initialState: FormState = { name: '', description: '' }

const App = () => {
  const [formState, setFormState] = useState<FormState>(initialState)
  const [todos, setTodos] = useState<CreateTodoInput[]>([])

  useEffect(() => {
    fetchTodos()
  }, [])

  const setInput = (key: string, value: string) => {
    setFormState({ ...formState, [key]: value })
  }

  //todoリストの取得
  const fetchTodos = async () => {
    try {
      const todoData = (await API.graphql(
        graphqlOperation(listTodos),
      )) as GraphQLResult<ListTodosQuery>
      //todoが取得できていればtodosにセット
      if (todoData.data?.listTodos?.items) {
        const todos = todoData.data.listTodos.items as CreateTodoInput[]
        setTodos(todos)
      }
    } catch (err) {
      console.log('error fetching todos')
    }
  }

  //フォームに入力されている内容でtodoの追加
  const addTodo = async () => {
    try {
      //フォームが両方埋まってないなら即終了
      if (!formState.name || !formState.description) return
      const todo: CreateTodoInput = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState);
      (await API.graphql(graphqlOperation(createTodo, { input: todo }))) as GraphQLResult<CreateTodoInput>
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  return (
    <div style={styles.container}>
      <h2>Amplify Todos</h2>
      <input
        onChange={(event) => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder='Name'
      />
      <input
        onChange={(event) => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder='Description'
      />
      <button style={styles.button} onClick={addTodo}>
        Create Todo
      </button>
      {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} style={styles.todo}>
          <p style={styles.todoName}>{todo.name}</p>
          <p style={styles.todoDescription}>{todo.description}</p>
        </div>
      ))}
    </div>
  )
}

const styles: {
  [key: string]: React.CSSProperties;
} = {
  container: {
    width: 400,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20,
  },
  todo: { marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: 'black',
    color: 'white',
    outline: 'none',
    fontSize: 18,
    padding: '12px 0px',
  },
};

export default withAuthenticator(App);
