// # Hashtag 페이지:
// 해시태그 페이지에서 특정 해시태그 관련 게시물들을 서버에서 불러와 클라이언트에 렌더링

// 1. 필요 라이브러리, 구성 요소 가져오기
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { END } from 'redux-saga';

import axios from 'axios';
import { LOAD_HASHTAG_POSTS_REQUEST } from '../../reducers/post';
import PostCard from '../../components/PostCard';
import wrapper from '../../store/configureStore';
import { LOAD_MY_INFO_REQUEST } from '../../reducers/user';
import AppLayout from '../../components/AppLayout';

// 2. Hashtag 컴포넌트 
const Hashtag = () => {
  // 2.1 Redux dispatch 함수 가져오기
  const dispatch = useDispatch();

  // 2.2 라우터 객체 가져오기
  const router = useRouter();

  // 2.3 현재 해시태그 가져오기
  const { tag } = router.query;

  // 2.4 현재 포스트 정보 가져오기:
  // 게시물 목록, 더 불러올 게시물 여부, 게시물 로딩 상태
  const { mainPosts, hasMorePosts, loadPostsLoading } = useSelector((state) => state.post);

  // 2.5 스크롤 이벤트 처리:
  // 스크롤 시 추가 포스트 로딩
  useEffect(() => {
    const onScroll = () => {
      if (window.pageYOffset + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
        if (hasMorePosts && !loadPostsLoading) {
          dispatch({
            type: LOAD_HASHTAG_POSTS_REQUEST,
            lastId: mainPosts[mainPosts.length - 1] && mainPosts[mainPosts.length - 1].id,
            data: tag,
          });
        }
      }
    };
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [mainPosts.length, hasMorePosts, tag, loadPostsLoading]);

  // 2.6 클라이언트 측 UI 렌더링
  return (
    <AppLayout>
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
  console.log(context);
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }

  // 3.2 로그인한 사용자 정보 로딩
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });

  // 3.3 포스트 로딩
  context.store.dispatch({
    type: LOAD_HASHTAG_POSTS_REQUEST,
    data: context.params.tag,
  });

  // 3.4 Saga 종료
  context.store.dispatch(END);

  // 3.5 Saga 비동기 작업 완료 대기
  await context.store.sagaTask.toPromise();
});

export default Hashtag;
