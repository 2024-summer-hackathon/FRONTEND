import React, { useEffect, useRef, useState } from "react";
import WebCam from "react-webcam";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as S from "./style";
import csound from "../../assets/camera.mp3";

export default function Webcam({ setImgs }) {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const webcamRef = useRef(null);
  const [camera, setCamera] = useState(false);
  const [change, setChange] = useState(false);
  const [poseImg, setPoseImg] = useState(null);
  const [num, setNum] = useState();
  const [cnt, setCnt] = useState(3);

  const videoConstraints = {
    width: 700,
    height: 484,
  };

  useEffect(() => {
    if (!change) {
      async function fetchData() {
        try {
          console.log(localStorage.getItem("selectedKeyword"));
          console.log(localStorage.getItem("selectType"));
          const response = await axios.get(
            `http://127.0.0.1:8000/pose/?string=${localStorage.getItem(
              "selectedKeyword",
            )}&people=2&type=${localStorage.getItem("selectType")}`,
          );

          if (poseImg == null) setPoseImg(response.data);
          setChange(true);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      fetchData();
    }
  }, []);

  const capture = () => {
    setCamera(true);

    setImgs([]);
    let count = 5;

    const countDown = (i) => {
      if (count > 0) {
        setNum(count);
        count--;
        setTimeout(() => countDown(i), 1000);
      } else {
        setCnt((prev) => prev - 1);
        audioRef.current.play();
        setNum(null);
        const newImg = webcamRef.current.getScreenshot();
        setImgs((prevImgs) => [...prevImgs, newImg]);
        if (i < 3) {
          count = 5;
          setTimeout(() => countDown(i + 1), 1000);
        } else {
          setTimeout(() => {
            setCamera(false);
            navigate("/photoResult");
          }, 1000);
        }
      }
    };

    countDown(0);
  };

  return (
    <S.Container>
      <S.Noaudio ref={audioRef} src={csound}></S.Noaudio>
      <S.Left>
        <S.TextBox>
          <S.ExText1 style={{ float: "left" }}>
            {parseInt(localStorage.getItem("selectType")) == 1
              ? `(${localStorage.getItem("selectedKeyword")})`
              : ""}{" "}
            추천 포즈 #1
          </S.ExText1>
        </S.TextBox>
        <S.Pose src={poseImg} alt="" />
      </S.Left>

      <S.Right>
        <S.TextBox>
          <S.ExText1 style={{ float: "left" }}>
            #3. 추천받은 포즈에 따라 하나뿐인 사진을 남겨보세요!
          </S.ExText1>
          <S.ExText style={{ float: "right" }}>
            {4 - cnt <= 4 ? 4 - cnt : 4} / 4
          </S.ExText>
        </S.TextBox>

        <WebCam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/png"
          videoConstraints={videoConstraints}
          mirrored={true}
        />
        <S.CountBox>{num}</S.CountBox>
        <S.Capture onClick={capture} disabled={camera}></S.Capture>
      </S.Right>
    </S.Container>
  );
}
