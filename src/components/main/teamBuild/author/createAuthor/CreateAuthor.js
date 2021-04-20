import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useAppDispatch, useAppState } from '../../../../../context/appContext';
import {
  createAuthorProfile,
  updateAuthorProfile,
} from '../../../../../service/api/profile';
import AuthorButton from '../../../common/ButtonWIthIcon';
import './editAuthorStyle.scss';
import EditDeleteButton from '../../../common/EditDeleteButton';
import PortfolioModal from './PortfolioModal';
import RoleModal from './RoleModal';
import { useTeamsDispatch } from '../../../../../context/teamContext';

const CreateAuthor = ({ type, history, detailData }) => {
  const setImgEl = useRef();
  const {
    userState,
    userInfo: { classOf },
  } = useAppState();
  const { setJobColor, translationKR } = useAppDispatch();
  const { setDefaultImg } = useTeamsDispatch();

  const [createAuthorQuery, setCreateAuthorQuery] = useState({
    introduce: null,
    mainRole: null,
    subRole: null,
  });

  // set Image
  const [file, setFile] = useState(null);
  const [isDefault, setIsDefault] = useState(true);
  const [customCN, setCustomCN] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setIsDefault(false);
  };

  useEffect(() => {
    previewImg();
    !isDefault ? setCustomCN('exist-img') : setCustomCN('');
  }, [file, isDefault]);

  const previewImg = () => {
    if (!file) return false;
    const roleBg = document.querySelector('.img');
    if (isDefault) {
      return (roleBg.style.backgroundImage = 'none');
    }
    const reader = new FileReader();
    reader.onload = () => {
      return (roleBg.style.backgroundImage = `url(${reader.result})`);
    };
    reader.readAsDataURL(file);
    setCustomCN('exist-img');
  };

  //set role
  const [modalShow, setModalShow] = useState(false);
  const { mainRole, subRole } = createAuthorQuery;

  const handleRoleChoice = (e) => {
    const { value, name } = e.target;
    let isDuplicate = false;

    if (name === 'mainProjectRole' && value === subRole) isDuplicate = true;

    if (name === 'subProjectRole' && value === mainRole) isDuplicate = true;

    if (isDuplicate) {
      toast.error('⛔ 대표직군과 부가직군은 중복하여 설정이 불가능합니다.');
      e.target.checked = false;
      setCreateAuthorQuery({
        ...createAuthorQuery,
        [name === 'mainProjectRole' ? 'mainRole' : 'subRole']: '',
      });
      return;
    }

    setCreateAuthorQuery({
      ...createAuthorQuery,
      [name === 'mainProjectRole' ? 'mainRole' : 'subRole']: value,
    });
  };

  const handleRoleSubmit = () => {
    if (mainRole === '' || subRole === '') {
      toast.error('⛔ 선택하지않은 직군이 있습니다.');
      return;
    }
    setModalShow(false);
  };

  useEffect(() => {
    if (classOf !== '' && userState.data !== null) {
      const { mainProjectRole, subProjectRole } = userState.data.user;
      setCreateAuthorQuery({
        ...createAuthorQuery,
        mainRole: mainProjectRole,
        subRole: subProjectRole,
      });
    }

    if (detailData !== undefined) {
      setCreateAuthorQuery({
        ...createAuthorQuery,
        introduce: detailData.content,
        mainRole: detailData.user.mainProjectRole,
        subRole: detailData.user.subProjectRole,
      });
    }
  }, [type, userState]);

  // set introduce
  const [textLen, setTextLen] = useState(0);
  const [txtOver, setTxtOver] = useState('');
  const [textSave, setTextSave] = useState(true);
  const [txt, setTxt] = useState('');

  const handleIntroduce = (e) => {
    if (textLen <= 1000) setTextSave(true);
  };

  const handleTextArea = (e) => {
    setCreateAuthorQuery({
      ...createAuthorQuery,
      introduce: e.target.value,
    });
    setTextLen(e.target.value.length);
    setTxt('저장되었습니다.');
    setTextSave(false);
  };

  useEffect(() => {
    textLen >= 1000 ? setTxtOver('over') : setTxtOver('');

    if (setImgEl.current) {
      Array.from(setImgEl.current.children).map(
        (el) => (el.style.height = `${el.clientWidth}px`),
      );
    }
  });

  // set portfolio
  const [portfolioShow, setPortfolioShow] = useState(false);
  const [portfolioEdit, setPortfolioEdit] = useState(false);
  const [portfolioLinks, setPortfolioLinks] = useState([]);
  const [id, setId] = useState(portfolioLinks.length);
  const [choiceId, setChoiceId] = useState('');
  const [portfolio, setPortfolio] = useState({
    title: '',
    link: '',
  });

  const showPortfolioModal = (type, data) => {
    switch (type) {
      case 'create':
        if (portfolioLinks.length >= 5) {
          toast.error('포트폴리오는 최대 5개까지 생성 가능합니다');
          return false;
        }

        setPortfolio({
          title: '',
          link: '',
        });

        setPortfolioShow(true);
        setPortfolioEdit(false);

        return;

      case 'edit':
        setPortfolioShow(true);
        setPortfolioEdit(true);

        setChoiceId(id);

        setPortfolio({
          ...portfolio,
          title: data.title,
          link: data.link,
        });

        return;

      default:
        break;
    }
  };

  const portfolioToggle = () => {
    if (portfolioEdit) {
      setPortfolioLinks(
        portfolioLinks.map((item) => {
          if (item.id === choiceId) {
            return {
              choiceId,
              title: portfolio.title,
              link: portfolio.link,
            };
          }
          return item;
        }),
      );
    } else {
      setId(id + 1);
      setPortfolioLinks(
        portfolioLinks.concat({
          id,
          ...portfolio,
        }),
      );
    }

    setPortfolioShow(false);
  };

  const handleChange = (e) => {
    setPortfolio({
      ...portfolio,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = (id, title) => {
    setPortfolioLinks(
      portfolioLinks.filter((portfolio) => portfolio.id !== id),
    );
    toast.success(`${title}이 삭제 되었습니다.`);
  };

  const handleSubmitAuthor = () => {
    if (createAuthorQuery.mainRole === null) {
      toast.error('⛔대표직군은 반드시 설정해 주세요.');
      return false;
    }

    if (!textSave) {
      toast.warn('자기소개글 설정을 확인해 주세요');
      return false;
    }
    console.log(isDefault);
    console.log();
    const formdata = new FormData();

    for (let name in createAuthorQuery) {
      formdata.append(name, createAuthorQuery[name]);

      if (createAuthorQuery[name] === null) {
        formdata.delete(name);
      }
    }
    console.log(detailData);
    // userState.data.mediaInfo.modifyName;
    isDefault
      ? formdata.append('deleteFileName', detailData.mediaInfo.modifyName)
      : formdata.append('image', file);

    return type === 'create'
      ? createAuthorProfile(classOf, formdata)
      : updateAuthorProfile(classOf, formdata);
  };

  const roleStyle = (role) => {
    if (role === '선택안함') return;
    return {
      color: 'white',
      backgroundColor: setJobColor(role),
      border: 'none',
    };
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ color: '#ffffff', fontWeight: 'bold' }}
      />
      {modalShow && (
        <RoleModal
          roleChoice={handleRoleChoice}
          roleSubmit={handleRoleSubmit}
          roleModalShow={modalShow}
          roleSetModalShow={setModalShow}
          mainRole={mainRole}
          subRole={subRole}
        />
      )}
      <>
        {portfolioShow ? (
          <PortfolioModal
            pfSubmit={portfolioToggle}
            pfChange={handleChange}
            pfModalShow={portfolioShow}
            pfSetModalShow={setPortfolioShow}
            data={portfolio}
          />
        ) : (
          <div className="edit-author-wrap">
            {/* 사진설정 */}
            <section className="edit-section">
              <h3 className="edit-author-title">
                <i className="title-icon" />
                사진 설정
              </h3>
              <p className="edit-author-description">
                자신을 나타낼 수 있는 사진들을 등록해보세요.
              </p>
              <div className="section-contents set-img" ref={setImgEl}>
                <div className={`custom-img ${customCN}`}>
                  <div className="img" />
                  <div className="set-img-icon">
                    <i className="icon" />
                    <span>사진 가져오기</span>
                  </div>
                  <label className="file-button" htmlFor="input-file" />
                  <input
                    type="file"
                    id="input-file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="default-img" onClick={() => setIsDefault(true)}>
                  <div
                    className="img"
                    style={{
                      backgroundImage: `url(${setDefaultImg(
                        createAuthorQuery.mainRole,
                      )})`,
                    }}
                  />
                  <div className="set-img-icon">
                    <i className="icon" />
                    <span>기본 이미지로 설정</span>
                  </div>
                </div>
              </div>
            </section>
            {/* 직군 설정 */}
            <section className="edit-section">
              <h3 className="edit-author-title">
                <i className="title-icon" />
                직군 설정
                <button
                  className="set-role-icon"
                  onClick={() => setModalShow(true)}
                />
              </h3>
              <p className="edit-author-description">
                자신의 직군을 설정하세요.(대표 1개, 부가직군 1개까지 설정 가능)
              </p>
              <div className="section-contents set-role">
                <ul>
                  <li>
                    <strong style={{ ...roleStyle(mainRole) }}>
                      {translationKR(mainRole)}
                    </strong>
                    <span>대표직군</span>
                  </li>
                  <li>
                    <strong style={{ ...roleStyle(subRole) }}>
                      {subRole !== '선택안함'
                        ? translationKR(subRole)
                        : '선택하세요'}
                    </strong>
                    <span>부가직군</span>
                  </li>
                </ul>
              </div>
            </section>
            {/* 자기소개글 설정 */}
            <section className="edit-section">
              <h3 className="edit-author-title">
                <i className="title-icon" />
                자기소개글 설정
              </h3>
              <p className="edit-author-description">
                자기소개글을 작성하세요.(공백 포함 1000자 이내)
              </p>
              <div className="section-contents set-introduce">
                <textarea
                  name="introduce"
                  maxLength={1000}
                  onChange={handleTextArea}
                  defaultValue={createAuthorQuery.introduce}
                ></textarea>
                <span
                  className={`txt-length ${txtOver}`}
                >{`${textLen}/1000`}</span>
                <div className="introduce-btn ">
                  {textSave && <span>{txt}</span>}
                  <AuthorButton
                    btntype="edit"
                    btnTxt="수정완료"
                    handleButton={handleIntroduce}
                  />
                </div>
              </div>
            </section>
            {/* 포트폴리오 설정 */}
            <section className="edit-section">
              <h3 className="edit-author-title">
                <i className="title-icon" />
                포트폴리오 설정
              </h3>
              <p className="edit-author-description">
                본인의 포트폴리오를 설정하세요.(최대 5개)
              </p>
              <div className="section-contents set-portfolio">
                <ul>
                  {portfolioLinks &&
                    portfolioLinks.map((data, i) => {
                      return (
                        <li className="portfolio" key={i}>
                          <i className="porfolio-icon"></i>
                          <div className="portfolio-title-box">
                            <strong className="porfolio-title">
                              {data.title}
                            </strong>
                            <div className="edit-delete-box">
                              <EditDeleteButton
                                form="portfolio"
                                handleEdit={() =>
                                  showPortfolioModal('edit', data)
                                }
                                handleDelete={() =>
                                  handleDelete(data.id, data.title)
                                }
                              />
                            </div>
                          </div>
                          <a
                            href={data.link}
                            className="porfolio-link"
                            target="blank"
                          >
                            {data.link}
                          </a>
                        </li>
                      );
                    })}
                </ul>

                <button
                  className="portfolio-add-btn"
                  onClick={() => showPortfolioModal('create')}
                >
                  <i className="porfolio-add-icon" />
                  등록하기
                </button>
              </div>
            </section>
            <AuthorButton
              btntype="save"
              btnTxt="변경사항 저장"
              handleButton={handleSubmitAuthor}
            />
          </div>
        )}
      </>
    </>
  );
};

export default CreateAuthor;