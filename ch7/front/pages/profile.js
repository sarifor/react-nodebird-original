// # Profile 페이지

// 1. 필요 라이브러리, 컴포넌트, 훅, 액션/상태 가져오기
import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import Router from 'next/router';
import { END } from 'redux-saga';
import axios from 'axios';
import useSWR from 'swr';

import AppLayout from '../components/AppLayout';
import NicknameEditForm from '../components/NicknameEditForm';
import FollowList from '../components/FollowList';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';
import { backUrl } from '../config/config';

const fetcher = (url) => axios.get(url, { withCredentials: true }).then((result) => result.data);

// 2. Profile 컴포넌트
const Profile = () => {
  // 2.1 현재 로그인된 사용자 상태, 팔로워/팔로잉 리스트 표시 제한 관리
  const { me } = useSelector((state) => state.user);
  const [followersLimit, setFollowersLimit] = useState(3);
  const [followingsLimit, setFollowingsLimit] = useState(3);

  // 2.2 팔로워/팔로잉 데이터 가져오기
  const { data: followersData, error: followerError } = useSWR(`${backUrl}/user/followers?limit=${followersLimit}`, fetcher);
  const { data: followingsData, error: followingError } = useSWR(`${backUrl}/user/followings?limit=${followingsLimit}`, fetcher);

  // 2.3 회원 정보가 존재하지 않으면 메인 페이지로 이동
  useEffect(() => {
    if (!(me && me.id)) {
      Router.push('/');
    }
  }, [me && me.id]);

  // 2.4 팔로잉/팔로워 더 보기
  const loadMoreFollowings = useCallback(() => {
    setFollowingsLimit((prev) => prev + 3);
  }, []);

  const loadMoreFollowers = useCallback(() => {
    setFollowersLimit((prev) => prev + 3);
  }, []);

  // 2.5 에러 처리
  if (!me) {
    return '내 정보 로딩중...';
  }

  if (followerError || followingError) {
    console.error(followerError || followingError);
    return <div>팔로잉/팔로워 로딩 중 에러가 발생합니다.</div>;
  }

  // 2.6 클라이언트 측 UI 렌더링
  return (
    <>
      <Head>
        <title>내 프로필 | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList header="팔로잉" data={followingsData} onClickMore={loadMoreFollowings} loading={!followingsData && !followingError} />
        <FollowList header="팔로워" data={followersData} onClickMore={loadMoreFollowers} loading={!followersData && !followerError} />
      </AppLayout>
    </>
  );
};

// 3. 서버 사이드 렌더링:
// 서버에서 초기 데이터 로드
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  console.log('getServerSideProps start');
  console.log(context.req.headers);

  // 3.1 쿠키 설정 초기화, 값 할당
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }

  // 3.2 로그인한 사용자 정보 로딩
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });

  // 3.3 Saga 종료
  context.store.dispatch(END);
  console.log('getServerSideProps end');

  // 3.4 Saga 비동기 작업 완료 대기
  await context.store.sagaTask.toPromise();
});

export default Profile;
