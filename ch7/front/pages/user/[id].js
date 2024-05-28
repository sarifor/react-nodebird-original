// # User 페이지:
// - 특정 사용자의 게시글 목록 페이지 생성
// - 서버 사이드 렌더링으로 초기 데이터 로드
// - 해당 사용자의 게시물을 무한 스크롤로 표시

// 1. 필요 라이브러리, 구성 요소 가져오기
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Card } from 'antd';
import { END } from 'redux-saga';
import Head from 'next/head';
import { useRouter } from 'next/router';

import axios from 'axios';
import { LOAD_USER_POSTS_REQUEST } from '../../reducers/post';
import { LOAD_MY_INFO_REQUEST, LOAD_USER_REQUEST } from '../../reducers/user';
import PostCard from '../../components/PostCard';
import wrapper from '../../store/configureStore';
import AppLayout from '../../components/AppLayout';

// 2. User 컴포넌트
const User = () => {
  // 2.1 Redux dispatch 함수 가져오기 
  const dispatch = useDispatch();

  // 2.2 라우터 객체 가져오기
  const router = useRouter();

  // 2.3 현재 페이지의 사용자 ID 가져오기
  const { id } = router.query;

  // 2.4 포스트 정보 가져오기
  const { mainPosts, hasMorePosts, loadPostsLoading } = useSelector((state) => state.post);

  // 2.5 사용자 정보 가져오기
  const { userInfo, me } = useSelector((state) => state.user);

  // 2.6 스크롤 이벤트 처리:
  // 스크롤 시 추가 포스트 로딩
  useEffect(() => {
    const onScroll = () => {
      if (window.pageYOffset + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
        if (hasMorePosts && !loadPostsLoading) {
          dispatch({
            type: LOAD_USER_POSTS_REQUEST,
            lastId: mainPosts[mainPosts.length - 1] && mainPosts[mainPosts.length - 1].id,
            data: id,
          });
        }
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [mainPosts.length, hasMorePosts, id, loadPostsLoading]);

  // 2.7 클라이언트 사이드 렌더링:
  // 메타 태그 설정, 사용자 정보/게시물 정보 표시
  return (
    <AppLayout>
      {userInfo && (
        <Head>
          <title>
            {userInfo.nickname}
            님의 글
          </title>
          <meta name="description" content={`${userInfo.nickname}님의 게시글`} />
          <meta property="og:title" content={`${userInfo.nickname}님의 게시글`} />
          <meta property="og:description" content={`${userInfo.nickname}님의 게시글`} />
          <meta property="og:image" content="https://nodebird.com/favicon.ico" />
          <meta property="og:url" content={`https://nodebird.com/user/${id}`} />
        </Head>
      )}
      {userInfo && (userInfo.id !== me?.id)
        ? (
          <Card
            style={{ marginBottom: 20 }}
            actions={[
              <div key="twit">
                짹짹
                <br />
                {userInfo.Posts}
              </div>,
              <div key="following">
                팔로잉
                <br />
                {userInfo.Followings}
              </div>,
              <div key="follower">
                팔로워
                <br />
                {userInfo.Followers}
              </div>,
            ]}
          >
            <Card.Meta
              avatar={<Avatar>{userInfo.nickname[0]}</Avatar>}
              title={userInfo.nickname}
            />
          </Card>
        )
        : null}
      {mainPosts.map((c) => (
        <PostCard key={c.id} post={c} />
      ))}
    </AppLayout>
  );
};

// 3. 서버 사이드 렌더링:
// 서버에서 초기 데이터 로드
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  // 3.1 쿠키 설정 초기화, 값 할당
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }

  // 3.2 포스트 로딩
  context.store.dispatch({
    type: LOAD_USER_POSTS_REQUEST,
    data: context.params.id,
  });

  // 3.3 로그인한 사용자 정보 로딩
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });

  // 3.4 특정 사용자 정보 로딩
  context.store.dispatch({
    type: LOAD_USER_REQUEST,
    data: context.params.id,
  });

  // 3.5 Saga 종료
  context.store.dispatch(END);

  // 3.6 Saga 비동기 작업 완료 대기
  await context.store.sagaTask.toPromise();
});

export default User;
