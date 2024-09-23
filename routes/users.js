// express 모듈 셋팅
const express = require('express')
const conn = require('../mariadb')
const router = express.Router()
router.use(express.json())

// 로그인 -> 같음
router
    .route('/login')
    .post((req, res) => {
        const {email, password} = req.body

        let sql = `SELECT * FROM users WHERE email = ?`
        let values = [email]

        conn.query(
            sql,
            values,
            function(err, results) {
                let loginUser = results[0]
                if (loginUser && loginUser.password === password) {
                    res.status(200).json({ message: `${loginUser.name}님 로그인이 성공하였습니다.` })
                } else {
                    res.status(404).json({ message: '이메일 또는 비밀번호가 틀렸습니다.' })
                }
            }
        )
    })

// 회원 가입
/*
router.post('/join', function(req, res) => {
    if (req.body == {}) {
        res.status(400).json({
            message: `입력 값을 다시 확인해주세요.`
        })
    } else {
        const {email, name, password, contact} = req.body
        
        conn.query(
            `INSERT INTO users (email, name, password, contact) VALUES (?, ?, ?, ?)`,
            [email, name, password, contact],
            function(err, results) {
                res.status(201).json(results)
            }
        )
    }
    })
*/
router
    .route('/join')
    .post((req, res) => {
        const {email, name, password, contact } = req.body

        let sql = `INSERT INTO users (email, name, password, contact) VALUES (?, ?, ?, ?)`
        let values = [email, name, password, contact]
        
        if (email && name && password) {
            conn.query(
                sql,
                values,
                function(err, results) {
                    res.status(201).json({ message: `${name}님 환영합니다. `})
                }
            )
        } else {
            res.status(400).json({ message: '빠진 입력값이 있습니다.' })
        }
    })

// 회원 개별 조회
router
    .route('/users')
    .get((req, res) => {
        let {email} = req.body

        let sql = `SELECT * FROM users WHERE email = ?`
        let values = [email]

        conn.query(
            sql,
            values,
            function(err, results) {
                if (results.length) {
                    res.status(200).json(...results)
                    console.log(results)
                } else {
                    res.status(404).json({ message: '회원 정보가 없습니다.'})
                }
            }
        )
    })

// 회원 개별 탈퇴
router
    .route('/users')
    .delete((req, res) => {
        let {email} = req.body

        let sql = `DELETE FROM users WHERE email = ?`
        let values = [email]

        conn.query(
            sql,
            values,
            function(err, results) {
                if (results.affectedRows) {
                    res.status(200).json({ message: '탈퇴가 완료되었습니다.' })
                } else {
                    res.status(404).json({ message: '회원 정보가 없습니다.'})
                    console.log(results)
                }  
            }
        )
    })

module.exports = router 