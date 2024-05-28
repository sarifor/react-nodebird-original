// # Post 페이지:
// 특정 게시물의 상세 페이지 생성
// 서버 사이드 렌더링으로 초기 데이터 로드
// 게시물을 SEO와 소셜 미디어 공유에 최적화된 메타 태그와 함께 표시

// 1. 필요 라이브러리, 구성 요소 가져오기
import React from 'react';
import { useRouter } from 'next/router';
import { END } from 'redux-saga';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Head from 'next/head';

import wrapper from '../../store/configureStore';
import { LOAD_MY_INFO_REQUEST } from '../../reducers/user';
import { LOAD_POST_REQUEST } from '../../reducers/post';
import AppLayout from '../../components/AppLayout';
import PostCard from '../../components/PostCard';

// 2. Post 컴포넌트
const Post = () => {
  // 2.1 라우터 객체 가져오기
  const router = useRouter();

  // 2.2 현재 포스트의 ID 가져오기
  const { id } = router.query;

  // 2.3 현재 포스트 정보 가져오기
  const { singlePost } = useSelector((state) => state.post);

  // if (router.isFallback) {
  //   return <div>로딩중...</div>;
  // }

  // 2.4 클라이언트 측 렌더링:
  // 포스트 메타데이터 설정, 렌더링
  return (
    <AppLayout>
      <Head>
        <title>
          {singlePost.User.nickname}
          님의 글
        </title>
        <meta name="description" content={singlePost.content} />
        <meta property="og:title" content={`${singlePost.User.nickname}님의 게시글`} />
        <meta property="og:description" content={singlePost.content} />
        <meta property="og:image" content={singlePost.Images[0] ? singlePost.Images[0].src : 'https://nodebird.com/favicon.ico'} />
        <meta property="og:url" content={`https://nodebird.com/post/${id}`} />
      </Head>
      <PostCard post={singlePost} />
    </AppLayout>
  );
};

// export async function getStaticPaths() {
//   return {
//     paths: [
//       { params: { id: '1' } },
//       { params: { id: '2' } },
//       { params: { id: '3' } },
//     ],
//     fallback: true,
//   };
// }

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
    type: LOAD_POST_REQUEST,
    data: context.params.id,
  });

  // 3.4 Saga 종료
  context.store.dispatch(END);

  // 3.5 Saga 비동기 작업 완료 대기
  await context.store.sagaTask.toPromise();
});

export default Post;
