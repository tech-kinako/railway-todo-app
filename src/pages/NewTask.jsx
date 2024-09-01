import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import axios from 'axios'
import { url } from '../const'
import { Header } from '../components/Header'
import './newTask.scss'
import { useNavigate } from 'react-router-dom'

export const NewTask = () => {
  const [selectListId, setSelectListId] = useState()
  const [lists, setLists] = useState([])
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [limit, setLimit] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [cookies] = useCookies()
  const navigate = useNavigate()
  const handleTitleChange = (e) => setTitle(e.target.value)
  const handleDetailChange = (e) => setDetail(e.target.value)
  const handleSelectList = (id) => setSelectListId(id)
  const onCreateTask = () => {

    if (!formCheck()) {
      return
    }

    const data = {
      title: title,
      detail: detail,
      done: false,
      limit: postFormatDate(),
    }

    axios
      .post(`${url}/lists/${selectListId}/tasks`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate('/')
      })
      .catch((err) => {
        setErrorMessage(`タスクの作成に失敗しました。${err}`)
      })
  }

  const handleLimitChange = (e) => {
    if (e.target.value === "") {
      setLimit("");
    } else {
      setLimit(e.target.value);
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

  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data)
        setSelectListId(res.data[0]?.id)
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`)
      })
  }, [])

  return (
    <div>
      <Header />
      <main className="new-task">
        <h2>タスク新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="new-task-form">
          <label>リスト</label>
          <br />
          <select onChange={(e) => handleSelectList(e.target.value)} className="new-task-select-list">
            {lists.map((list, key) => (
              <option key={key} className="list-item" value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
          <br />
          <label>タイトル</label>
          <br />
          <input type="text" onChange={handleTitleChange} className="new-task-title" />
          <br />
          <label>詳細</label>
          <br />
          <textarea type="text" onChange={handleDetailChange} className="new-task-detail" />
          <br />
          <label>期限</label>
          <br />
          <input type="datetime-local" onChange={handleLimitChange} className="new-task-limit" />
          <br />
          <button type="button" className="new-task-button" onClick={onCreateTask}>
            作成
          </button>
        </form>
      </main>
    </div>
  )
}
