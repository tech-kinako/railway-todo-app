import React, { useEffect, useState } from 'react'
import { Header } from '../components/Header'
import axios from 'axios'
import { useCookies } from 'react-cookie'
import { url } from '../const'
import { useNavigate, useParams } from 'react-router-dom'
import './editTask.scss'

export const EditTask = () => {
  const navigate = useNavigate()
  const { listId, taskId } = useParams()
  const [cookies] = useCookies()
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [limit, setLimit] = useState('')
  const [forLimit, setForLimit] = useState('')
  const [isDone, setIsDone] = useState()
  const [errorMessage, setErrorMessage] = useState('')
  const handleTitleChange = (e) => setTitle(e.target.value)
  const handleDetailChange = (e) => setDetail(e.target.value)
  const handleIsDoneChange = (e) => setIsDone(e.target.value === 'done')
  const onUpdateTask = () => {

    if(!formCheck()) {
      return;
    }

    const data = {
      title: title,
      detail: detail,
      done: isDone,
      limit: postFormatDate(),
    }
    console.log(limit)

    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate('/')
      })
      .catch((err) => {
        setErrorMessage(`更新に失敗しました。${err}`)
      })
  }

  const onDeleteTask = () => {
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate('/')
      })
      .catch((err) => {
        setErrorMessage(`削除に失敗しました。${err}`)
      })
  }

  const handleLimitChange = (e) => {
    if (e.target.value === "") {
      setLimit("");
      setForLimit("日時が設定されていません");
    } else {
      setLimit(e.target.value);
      calcForLimit(e.target.value);
    }
  }

  const postFormatDate = () => {
    const date = new Date(limit);
    const year = String(date.getFullYear());
    const month = String((date.getMonth() + 1)).padStart(2,'0');
    const day = String(date.getDate()).padStart(2,'0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minutes}:${seconds}Z`;
  }

  const formCheck = () => {
    const errorData = {
      isTitle: false,
      isDetail: false,
      isLimit: false,
    }

    if(title === "") errorData.isTitle = true;
    if(detail === "") errorData.isDetail = true;
    if(limit === "") errorData.isLimit = true;

    if (errorData.isTitle || errorData.isDetail || errorData.isLimit) {
    const errorMessage = `${errorData.isTitle? "タイトルが入力されていません" : ""}\n${errorData.isDetail? "詳細が入力されていません" : ""}\n${errorData.isLimit? "期限が入力されていません" : ""}`;
    alert(errorMessage);
    return false
    } else {
      return true
    }
  }

  const calcForLimit = (limitValue) => {
    const nowDate = new Date();
    const limitDate = new Date(limitValue);
    const diffTime = limitDate - nowDate;
    const days = (diffTime / (1000*60*60*24));
    const hours = (diffTime % (1000*60*60*24) / (1000*60*60));
    const minutes = (diffTime % (1000*60*60) / (1000*60));
    setForLimit(`${Math.floor(days)}日 ${Math.floor(hours)}時間 ${Math.floor(minutes)}分`);
  }

  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        const task = res.data
        setTitle(task.title)
        setDetail(task.detail)
        setIsDone(task.done)
        setLimit(editFormatDate(task.limit));
        calcForLimit(task.limit);
      })
      .catch((err) => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`)
      })
  }, [])

  const editFormatDate = (limit) => {
    const date = new Date(limit);
    const year = String(date.getUTCFullYear());
    const month = String((date.getUTCMonth() + 1)).padStart(2,'0');
    const day = String(date.getUTCDate()).padStart(2,'0');
    const hour = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minutes}`;
  }

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label>
          <br />
          <input type="text" onChange={handleTitleChange} className="edit-task-title" value={title} />
          <br />
          <label>詳細</label>
          <br />
          <textarea type="text" onChange={handleDetailChange} className="edit-task-detail" value={detail} />
          <br />
          <label>期限</label>
          <p className="for-limit">(残り時間：{forLimit})</p>
          <br />
          <input type="datetime-local" onChange={handleLimitChange} className="edit-task-limit" value={limit}/>
          <br />
          <div>
            <input
              type="radio"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={isDone === false ? 'checked' : ''}
            />
            未完了
            <input
              type="radio"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone === true ? 'checked' : ''}
            />
            完了
          </div>
          <button type="button" className="delete-task-button" onClick={onDeleteTask}>
            削除
          </button>
          <button type="button" className="edit-task-button" onClick={onUpdateTask}>
            更新
          </button>
        </form>
      </main>
    </div>
  )
}
