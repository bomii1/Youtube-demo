// express 모듈 셋팅
const express = require('express')
const conn = require('../mariadb')
// 바디로 넘어오기 때문에 바디 값만, validationResult 오류가 났을 때 오류를 받아주는 변수
// express-validator 에 존재하는 변수
const {body, param, validationResult} = require('express-validator') 
const router = express.Router()

router.use(express.json()) // json을 json 바디에서 꺼내서 편하게 쓸 수 있게 해주는 모듈

// 모듈화를 시켜서 validate 변수에 담음
const validate = (req, res, next) => {
    const err = validationResult(req)

    if (err.isEmpty()) {
        return next()
    } else {
        return res.status(400).json(err.array()) // 다음 할 일(미들웨어, 함수) 찾아가라
    }
}
// 라우터에서 get 메소드는 콜백함수를 부르기 전에 할 일이 있었고, 그 다음이 콜백함수
router
    .route('/')
    .get(
        [
            body('user_id').notEmpty().isInt().withMessage('숫자 입력 필요'),
            validate
        ]
        ,(req, res, next) => {
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
        [
            body('user_id').notEmpty().isInt().withMessage('숫자 입력 필요'),
            body('name').notEmpty().isString().withMessage('문자 입력 필요'),
            validate
        ]
        , (req, res) => {
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
        [
            param('id').notEmpty().withMessage('채널 id 필요'),
            validate
        ]
        ,(req, res) => {
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
        [
            param('id').notEmpty().withMessage('채널 id 필요'),
            body('name').notEmpty().isString().withMessage('채널명 오류'),
            validate
        ]
        ,(req, res) => {
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
        [
            param('id').notEmpty().withMessage('채널 id 필요'),
            validate
        ]
        ,(req, res) => {
            let {id} = req.params
            id = parseInt(id)

            const sql = `DELETE FROM channels WHERE id = ?`
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