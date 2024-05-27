import { useRef, useState } from 'react';
import { pdfjs } from 'react-pdf';
import hero from '@/assets/images/hero.png';
import DescNums from './DescNums';
import SectionWrapper from '../SectionWrapper';
import TextModal from '../../UI/TextModal'; 
import axios from 'axios';
import { AlzheimerStageData } from '@/Components/Shared/Consts';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const alzheimer_prediction_url = 'https://alzheimers-prediction.onrender.com/predict';

const Home = () => {
  const fileInputRef = useRef(null);
  const [shortName, setShortName] = useState("");
  const [longName, setLongName] = useState("");
  const [desc, setDesc] = useState("");
  const [source, setSource] = useState("");
  const [showModal, setShowModal] = useState(false); 

  const handleUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const typedarray = new Uint8Array(event.target.result);

      const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
      const extractedText = await extractText(pdf);

      // setText(extractedText);
      // console.log(extractedText);

      const jsonObject = {};
      const cleanedText = extractedText.replace("Alzheimer's Patient Medical Report", '').replace('Not Hisp/Latino', 'Not_Hisp/Latino').trim();
      const t_pairs = cleanedText.split(' ');
      const pairs = t_pairs.filter(item => item !== "");
      
      for (let i = 0; i < pairs.length; i += 2) {
        const key = pairs[i];
        const value = pairs[i + 1];
        
        if (!isNaN(value) && value !== '') {
          jsonObject[key] = parseFloat(value);
        } else if (value === 'None') {
          jsonObject[key] = null;
        } else {
          jsonObject[key] = value;
        }
      }
      
      const response = await axios.post(alzheimer_prediction_url, jsonObject, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
      });
      // console.log(response.data[0]);
      const respData = response.data[0];
      setShortName(respData);
      setLongName(AlzheimerStageData[respData]["name"]);
      setDesc(AlzheimerStageData[respData]["desc"]);
      setSource(AlzheimerStageData[respData]["img_src"]);

      setShowModal(true); 
    };

    reader.readAsArrayBuffer(file);
  };

  const extractText = async (pdf) => {
    let extractedText = "";
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      textContent.items.forEach((textItem) => {
        extractedText += textItem.str + " ";
      });
    }

    return extractedText;
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <SectionWrapper id="home">
      <div className="flex flex-col-reverse  md:flex-row items-center justify-between gap-10 text-center md:text-left">
        <div className=" tracking-wider md:tracking-normal max-w-xs lg:max-w-xl ">
          <h1 className="lg:text-7xl text-4xl font-bold">
            Your Health Is Our Top Priority
          </h1>
          <p className="text-lg md:text-base lg:text-xl my-10">
            Discover Alzheimer's risk factors early. Empower yourself and your loved ones with early detection and understanding.
          </p>
          <button onClick={handleUpload} className="bg-primary transition hover:bg-[#158ace] px-8 py-1 shadow-lg rounded-3xl text-white">
            Predict Now
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
        <div className="max-w-xs md:max-w-none">
          <img src={hero} alt="hero" />
        </div>
      </div>
      <DescNums />

      {showModal && <TextModal short={shortName} long={longName} desc={desc} source={source} onClose={closeModal} />}
    </SectionWrapper>
  );
};

export default Home;
