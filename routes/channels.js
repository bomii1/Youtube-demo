// express 모듈 셋팅
const express = require('express')
const conn = require('../mariadb')
const router = express.Router()

router.use(express.json()) // json을 json 바디에서 꺼내서 편하게 쓸 수 있게 해주는 모듈

let db = new Map()
let id = 1 // 하나의 객체를 유니크하게 구별하기 위함

router
    .route('/')
    .get((req, res) => {
        let {user_id} = req.body

        let sql = `SELECT * FROM channels WHERE user_id = ?`
        
        if (user_id) {
            conn.query(
                sql,
                user_id,
                function(err, results) {
                    if (results.length) {
                        res.status(200).json(...results)
                    } else {
                        notFoundChannel(res)
                    }
                }
            )
        } else {
            res.status(400).end()
        }
    }) // 채널 전체 조회
    .post((req, res) => {
        let {name, user_id} = req.body

        if (name && Number(user_id)) {
            
            let sql = `INSERT INTO channels (name, user_id) VALUES (?, ?)`
            let values = [name, user_id]

            conn.query(
                sql,
                values,
                function(err, results) {
                    res.status(201).json(results)
                }
            )
        } else {
            res.status(400).json({ message: '요청 값을 제대로 보내주세요. '})
        }
    }) // 채널 개별 생성


router
    .route('/:id')
    .get((req, res) => {
        let {id} = req.params
        id = parseInt(id)

        let sql = `SELECT * FROM channels WHERE id = ?`

        conn.query(
            sql,
            id,
            function(err, results) {
                if (results.length) {
                    res.status(200).json(...results)
                } else {
                    notFoundChannel(res)
                }
            }
        )
    }) // 채널 개별 조회
    .put((req, res) => {
        let {id} = req.params
        id = parseInt(id)
        const newTitle = req.body.channelTitle
        let channel = db.get(id)

        if (newTitle) {
            console.log(channel)
            if (channel) {
                const oldTitle = channel.channelTitle
                channel.channelTitle = newTitle
                db.set(id, channel)
                res.status(201).json({
                    message: `채널명이 성공적으로 수정되었습니다. 기존 ${oldTitle} -> 수정 ${newTitle}`
                })
            } else {
                notFoundChannel()
            }
        } else {
            res.status(400).json({
                message: '올바른 채널명이 아닙니다'
            })
        }
        }) // 채널 개별 수정
    .delete((req, res) => {
        let {id} = req.params
        id = parseInt(id)
        const channel = db.get(id)

        if (channel) {
            db.delete(id)
            console.log(db)
            res.status(200).json({
                message: `${channel.channelTitle}이 정상적으로 삭제되었습니다.`
            })
        } else {
            notFoundChannel()
        }
    }) // 채널 개별 삭제

    function notFoundChannel(res) {
        res.status(404).json({
            message: '채널 정보를 찾을 수 없습니다.'
        })
    }

    module.exports = router