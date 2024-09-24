// express 모듈 셋팅
const express = require('express')
const conn = require('../mariadb')
// 바디로 넘어오기 때문에 바디 값만, validationResult 오류가 났을 때 오류를 받아주는 변수
// express-validator 에 존재하는 변수
const {body, param, validationResult} = require('express-validator') 
const router = express.Router()

router.use(express.json()) // json을 json 바디에서 꺼내서 편하게 쓸 수 있게 해주는 모듈

router
    .route('/')
    .get(
        body('user_id').notEmpty().isInt().withMessage('숫자 입력 필요')
        ,(req, res) => {
            const err = validationResult(req)

            if (!err.isEmpty()) {
                return res.status(400).json(err.array())
            }

            let {user_id} = req.body

            let sql = `SELECT * FROM channels WHERE user_id = ?`
            conn.query(sql, user_id,
                function(err, results) {
                    if (err) {
                        console.log(err)
                        return res.status(400).end()
                    }

                    if (results.length) {
                        res.status(200).json(results)
                    } else {
                        notFoundChannel(res)
                    }
                }
            )
    }) // 채널 전체 조회
    .post(
        [body('user_id').notEmpty().isInt().withMessage('숫자 입력 필요'),
         body('name').notEmpty().isString().withMessage('문자 입력 필요')]
        , (req, res) => {
                const err = validationResult(req) // 유효성 검사했는데 에러가 났을 때

                if (!err.isEmpty()) {
                    return res.status(400).json(err.array())
                }
            
                const {name, user_id} = req.body

                let sql = `INSERT INTO channels (name, user_id) VALUES (?, ?)`
                let values = [name, user_id]
                conn.query(sql,values,
                    function(err, results) {
                        if (err) { // sql 에러 처리
                            console.log(err)
                            return res.status(400).end()
                        }

                        res.status(201).json(results)
                    }
                )
    }) // 채널 개별 생성


router
    .route('/:id')
    .get(
        param('id').notEmpty().withMessage('채널 id 필요')
        ,(req, res) => {
            const err = validationResult(req)

            if (!err.isEmpty()) {
                return res.status(400).json(err.array())
            }

            let {id} = req.params
            id = parseInt(id)

            let sql = `SELECT * FROM channels WHERE id = ?`
            conn.query(sql, id,
                function(err, results) {
                    if (err) {
                        console.log(err)
                        res.status(400).end()
                    }

                    if (results.length) {
                        res.status(200).json(...results)
                    } else {
                        notFoundChannel(res)
                    }
                }
            )
    }) // 채널 개별 조회
    .put(
        [param('id').notEmpty().withMessage('채널 id 필요'),
         body('name').notEmpty().isString().withMessage('채널명 오류')]
        ,(req, res) => {
            const err = validationResult(req)

            if (!err.isEmpty()) {
                return res.status(400).json(err.array())
            }

            let {id} = req.params
            id = parseInt(id)
            let {name} = req.body

            let sql = `UPDATE channels SET name = ? WHERE id = ?`
            let values = [name, id]

            conn.query(sql, values,
                function(err, results) {
                    if (err) {
                        console.log(err)
                        res.status(400).end()
                    }
                    if (results.affectedRows) {
                        res.status(200).json({ message: '수정이 완료되었습니다.' })
                    } else {
                        res.status(400).send(results)
                    }
                }
            )
        }) // 채널 개별 수정
    .delete(
        param('id').notEmpty().withMessage('채널 id 필요')
        ,(req, res) => {
            const err = validationResult(req)

            if (!err.isEmpty()) {
                return res.status(400).json(err.array())
            }

            let {id} = req.params
            id = parseInt(id)

            const sql = `DELETE FROM channels WHERE id = ?`
            const channel = db.get(id)

            conn.query(sql, id,
                function(err, results) {
                    if (err) {
                        return res.status(400).end()
                    }
                    if (results.affectedRows) {
                        res.status(200).json({ message: '삭제되었습니다.' })
                    } else {
                        res.status(404).end()
                    }
                }
            )
    }) // 채널 개별 삭제

    function notFoundChannel(res) {
        res.status(404).json({
            message: '채널 정보를 찾을 수 없습니다.'
        })
    }

    module.exports = router