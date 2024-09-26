// express 모듈 셋팅
const express = require('express');
const conn = require('../mariadb');
const router = express.Router();
const {body, param, validationResult} = require('express-validator');

// jwt 모듈
const jwt = require('jsonwebtoken');

// dotenv 모듈
const dotenv = require('dotenv');
dotenv.config();

router.use(express.json());

// 모듈화를 시켜서 validate 변수에 담음
const validate = (req, res, next) => {
    const err = validationResult(req);

    if (err.isEmpty()) {
        return next();
    } else {
        return res.status(400).json(err.array()); // 다음 할 일(미들웨어, 함수) 찾아가라
    }
};

router
    .route('/login')
    .post(
        [
            body('email').notEmpty().isEmail().withMessage('이메일 확인 필요'),
            validate
        ],
        (req, res, next) => {
            const {email, password} = req.body

            let sql = `SELECT * FROM users WHERE email = ?`
            let values = [email]
            conn.query(sql, values,
                function(err, results) {
                    if (err) {
                        return res.status(400).end()
                    }
                    let loginUser = results[0]

                    if (loginUser && loginUser.password === password) {
                        // token 발급
                        const token = jwt.sign({
                            email: loginUser.email,
                            name: loginUser.name
                        }, process.env.PRIVATE_KEY, {
                            expiresIn: '5m',
                            issuer: 'test'
                        });
                        console.log(token);

                        res.cookie("token", token, {
                            httpOnly: true
                        }); // 쿠키에 토큰 담음

                        res.status(200).json({
                            message: `${loginUser.name}님 로그인이 성공하였습니다.`
                        })
                    } else {
                        res.status(403).json({
                            message: '이메일 또는 비밀번호가 틀렸습니다.'
                        })
                    }
                }
            )
        })

router
    .route('/join')
    .post(
        [
            body('email').notEmpty().isEmail().withMessage('이메일 확인 필요'),
            body('name').notEmpty().isString().withMessage('이름 확인 필요'),
            body('password').notEmpty().isString().withMessage('비밀번호 확인 필요'),
            body('contact').notEmpty().isString().withMessage('연락처 확인 필요'),
            validate
        ],
        (req, res, next) => {
            const {email, name, password, contact } = req.body

            let sql = `INSERT INTO users (email, name, password, contact) VALUES (?, ?, ?, ?)`
            let values = [email, name, password, contact]
            conn.query(sql, values,
                function(err, results) {
                    if (err) {
                        return res.status(400).end()
                    }
                    console.log('회원가입', results)
                    res.status(201).json({ message: `${name}님 환영합니다. `})
                }
            )
        })

router
    .route('/users')
    .get(
        [
            body('email').notEmpty().isEmail().withMessage('이메일 확인 필요'),
            validate
        ],
        (req, res, next) => {
            let {email} = req.body

            let sql = `SELECT * FROM users WHERE email = ?`
            let values = [email]
            conn.query(sql, values,
                function(err, results,fields) {
                    if (err) {
                        return res.status(400).end()
                    }
                    if (results.length) {
                        res.status(200).json(...results)
                        console.log('회원 개별 조회', results, fields.length)
                    } else {
                        res.status(404).json({ message: '회원 정보가 없습니다.'})
                    }
                }
            )
        }) // 회원 개별 조회
    .delete(
        [
            body('email').notEmpty().isEmail().withMessage('이메일 확인 필요'),
            validate
        ],
        (req, res, next) => {
            let {email} = req.body

            let sql = `DELETE FROM users WHERE email = ?`
            let values = [email]
            conn.query(sql, values,
                function(err, results) {
                    console.log('탈퇴', results)
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
        }) // 회원 개별 탈퇴

module.exports = router 