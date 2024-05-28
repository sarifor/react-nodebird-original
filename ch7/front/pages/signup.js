// # Signup 페이지

// 1. 필요 라이브러리, 컴포넌트, 훅, 액션/상태 가져오기
import React, { useCallback, useState, useEffect } from 'react';
import Head from 'next/head';
import { Form, Input, Checkbox, Button } from 'antd';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import Router from 'next/router';
import axios from 'axios';
import { END } from 'redux-saga';

import AppLayout from '../components/AppLayout';
import useInput from '../hooks/useInput';
import { LOAD_MY_INFO_REQUEST, SIGN_UP_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';

// 2. 입력 오류 메시지 스타일링
const ErrorMessage = styled.div`
  color: red;
`;

// 3. Signup 컴포넌트
const Signup = () => {
  // 3.1 Redux dispatch 함수 가져오기
  const dispatch = useDispatch();

  // 3.2 회원가입 성공/실패 등에 따른 상태 가져오기
  const { signUpLoading, signUpDone, signUpError, me } = useSelector((state) => state.user);

  // 3.3 회원 정보가 존재하면 메인 페이지로 이동
  useEffect(() => {
    if (me && me.id) {
      Router.replace('/');
    }
  }, [me && me.id]);

  // 3.4 회원가입 완료되면 메인 페이지로 이동
  useEffect(() => {
    if (signUpDone) {
      Router.replace('/');
    }
  }, [signUpDone]);

  // 3.5 회원가입 에러 시 알림
  useEffect(() => {
    if (signUpError) {
      alert(signUpError);
    }
  }, [signUpError]);

  // 3.6 입력값 상태, 이벤트 핸들러
  const [email, onChangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, onChangePassword] = useInput('');

  // 3.7 비밀번호 확인 관련 상태, 이벤트 핸들러
  const [passwordCheck, setPasswordCheck] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const onChangePasswordCheck = useCallback((e) => {
    setPasswordCheck(e.target.value);
    setPasswordError(e.target.value !== password);
  }, [password]);

  // 3.8 약관 동의 관련 상태, 이벤트 핸들러
  const [term, setTerm] = useState('');
  const [termError, setTermError] = useState(false);
  const onChangeTerm = useCallback((e) => {
    setTerm(e.target.checked);
    setTermError(false);
  }, []);

  // 3.9 회원가입 폼 제출 시 처리 함수
  const onSubmit = useCallback(() => {
    if (password !== passwordCheck) {
      return setPasswordError(true);
    }
    if (!term) {
      return setTermError(true);
    }
    console.log(email, nickname, password);
    dispatch({ // SIGN_UP_REQUEST 액션을 Redux store에 dispatch 
      type: SIGN_UP_REQUEST,
      data: { email, password, nickname },
    });
  }, [email, password, passwordCheck, term]);

  // 3.10 클라이언트 측 UI 렌더링
  return (
    <AppLayout>
      <Head>
        <title>회원가입 | NodeBird</title>
      </Head>
      <Form onFinish={onSubmit}>
        <div>
          <label htmlFor="user-email">이메일</label>
          <br />
          <Input name="user-email" type="email" value={email} required onChange={onChangeEmail} />
        </div>
        <div>
          <label htmlFor="user-nick">닉네임</label>
          <br />
          <Input name="user-nick" value={nickname} required onChange={onChangeNickname} />
        </div>
        <div>
          <label htmlFor="user-password">비밀번호</label>
          <br />
          <Input name="user-password" type="password" value={password} required onChange={onChangePassword} />
        </div>
        <div>
          <label htmlFor="user-password-check">비밀번호체크</label>
          <br />
          <Input
            name="user-password-check"
            type="password"
            value={passwordCheck}
            required
            onChange={onChangePasswordCheck}
          />
          {passwordError && <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>}
        </div>
        <div>
          <Checkbox name="user-term" checked={term} onChange={onChangeTerm}>건강하고 행복하게 살 것에 동의합니다.</Checkbox>
          {termError && <ErrorMessage>약관에 동의하셔야 합니다.</ErrorMessage>}
        </div>
        <div style={{ marginTop: 10 }}>
          <Button type="primary" htmlType="submit" loading={signUpLoading}>가입하기</Button>
        </div>
      </Form>
    </AppLayout>
  );
};

// 4. 서버 사이드 렌더링:
// 서버에서 초기 데이터 로드
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  console.log('getServerSideProps start');
  console.log(context.req.headers);

  // 4.1 쿠키 설정 초기화, 값 할당
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }

  // 4.2 로그인한 사용자 정보 로딩
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });

  // 4.3 Saga 종료
  context.store.dispatch(END);
  console.log('getServerSideProps end');

  // 4.4 Saga 비동기 작업 완료 대기
  await context.store.sagaTask.toPromise();
});

export default Signup;
