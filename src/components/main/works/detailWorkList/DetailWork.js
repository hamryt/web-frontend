import React, { useRef } from 'react';
import { useEffect, useState } from 'react/cjs/react.development';
import { useAppDispatch, useAppState } from '../../../../context/appContext';
import { useWorksDispatch } from '../../../../context/worksContext';
import useAsync from '../../../../hooks/useAsync';
import { deleteWorks, getWorkDetail } from '../../../../service/api/work';
import EditDeleteButton from '../../common/EditDeleteButton';
import './detailWorkStyle.scss';
import { Viewer } from '@toast-ui/react-editor';
import { client } from '../../../../service/api/client';

const DetailWork = ({ match, history }) => {
  const { worksKR, worksColor } = useAppDispatch();

  const {
    currentYears,
    userInfo: { name, isLogin },
    curSize,
  } = useAppState();

  const { setDetailData } = useWorksDispatch();

  const detailId = match.params.id;
  const [best, setBest] = useState(false);
  const [workDetail2, setWorkDetail] = useState(null);
  const [workDetail, refetch] = useAsync(
    async () => await getWorkDetail(detailId),
    [detailId],
  );

  const { loading, data, error } = workDetail;

  const handleDelete = () => {
    const delMessage = window.confirm(`졸업 작품을 삭제 하시겠습니까?`);
    if (delMessage) {
      deleteWorks(detailId);
      setTimeout(() => history.push(`/works/${currentYears}`), 1000);
    }
  };

  const filterDate = () => {
    const splitIdx = createDate.indexOf('T');
    return createDate.slice(0, splitIdx).split('-').join('. ');
  };

  const slideRef = useRef();
  const [slideWidth, setSlideWidth] = useState(0);
  const [slideNum, setSlideNum] = useState(0);
  const [slideLen, setSlideLen] = useState(0);

  useEffect(() => {
    const secContetns = document.querySelectorAll(
      '.work-detail-wrap .sec-content',
    );

    Array.from(secContetns).map((el) => {
      el.style.height = `${Math.floor(el.clientWidth / 4) * 2.4}px`;
    });

    // slide
    const slides = slideRef.current;
    if (slides) {
      const slide = Array.from(slides.children);
      const slideHieght = slides.parentElement.clientHeight;
      setSlideWidth(slides.parentElement.clientWidth);
      setSlideLen(slide.length);

      const slideWrapWidth = slideWidth * slide.length;

      slides.style.width = `${slideWrapWidth}px`;
      slides.style.height = `${slideHieght}px`;
      slides.style.left = `-${slideWidth * slideNum}px`;
      slides.style.transition = `left ease 0.6s`;

      slide.map((li) => {
        li.style.width = `${slideWidth}px`;
      });

      // slide controller
      const btnBox = slides.nextSibling;

      if (btnBox) {
        btnBox.style.width = `${slideWidth}px`;
      }
    }
  });

  const teamCategoryStyle = () => {
    const style = {
      color: worksColor(projectCategory),
      borderColor: worksColor(projectCategory),
    };
    return style;
  };

  if (loading) return <div>로딩중...</div>;
  if (!data) return null;
  if (error) return <div>에러 _ worksDetail</div>;

  const handleEdit = () => {
    setDetailData(data);
    history.push(`${match.url}/edit`);
  };

  const handleSlide = (e) => {
    const btnType = e.target.id;

    if (btnType === 'next-btn') {
      if (slideNum < slideLen - 1) setSlideNum(slideNum + 1);
    } else {
      if (slideNum > 0) setSlideNum(slideNum - 1);
    }
  };

  const handleDownload = (e) => {
    if (!e.target.classList.contains('exist')) return false;
    e.target.href = data.fileInfo.url;
  };

  const {
    author,
    projectCategory,
    workName,
    teamName,
    teamMember,
    createDate,
    imageInfoList,
    content,
    teamVideoUrl,
    fileInfo,
  } = data;
  console.log(data);
  return (
    <div className="work-detail-wrap page-box">
      <div className="work-detail-inr">
        <div className="work-detail-header">
          <span className="team-category" style={teamCategoryStyle()}>
            {worksKR(projectCategory)}
          </span>
          <strong className="work-name">{workName}</strong>
          <div className="team-info">
            {teamName}
            <div className="team-member">
              {teamMember.map((member, i) => (
                <span key={i}>{member}</span>
              ))}
            </div>
          </div>
          <div className="team-etc">
            <span className="create-date">
              <i className="date-icon" />
              {filterDate()}
            </span>
            {author === name && (
              <EditDeleteButton
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            )}
          </div>
        </div>
        <div className="work-detail-content">
          {best && (
            <div className="best-work">
              <i className="best-icon" /> 졸업작품 최우수작
            </div>
          )}
          <section className="about-team-vedio">
            <strong>팀 소개영상</strong>
            <div className="team-vedio sec-content">
              <video
                controls
                style={{ width: '100%', height: '100%' }}
                autoPlay
              >
                <source src="https://youtu.be/yZw9G8Zl0UI" />
                <source type="video/ogg" src={teamVideoUrl} />
                해당 브라우저는 vedio를 지원하지 않습니다.
              </video>
            </div>
          </section>
          <section className="about-team-images">
            <strong>작품 사진</strong>
            <div className="work-images sec-content">
              {imageInfoList ? (
                <>
                  <ul className="slide-wrap" ref={slideRef}>
                    {imageInfoList.map((image, i) => (
                      <li key={i} className="slide">
                        <span
                          style={{ backgroundImage: `url(${image.url})` }}
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="slide-btn-box">
                    <button type="button" id="prev-btn" onClick={handleSlide} />
                    <button type="button" id="next-btn" onClick={handleSlide} />
                  </div>
                </>
              ) : (
                '등록된 작품 사진이 없습니다.'
              )}
            </div>
          </section>
          <section className="about-team-introduce">
            <strong>작품 소개</strong>
            <Viewer initialValue={content} />
          </section>
        </div>
        <div className="work-detail-footer">
          <div className="download-file" onClick={handleDownload}>
            <a
              className={`file-box ${fileInfo ? 'exist' : ''}`}
              target="_blank"
            >
              <i className="clip-icon" />
              <span className="file-name">
                {fileInfo ? fileInfo.originalName : '등록된 파일이 없습니다.'}
              </span>
              <i className="download-icon" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailWork;
