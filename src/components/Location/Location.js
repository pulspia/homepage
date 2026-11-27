import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

const content = {
  ko: {
    title: '회사 위치',
    subtitle: '주식회사 펄스피아를 찾아오시는 길',
    addressTitle: '주소',
    address: '경기도 광명시 소하로 190, B동 621-8호',
    buildingName: '(광명G타워)',
    viewOnNaverMap: '네이버 지도에서 보기',
    viewOnMap: '네이버 지도 보기',
  },
  en: {
    title: 'Location',
    subtitle: 'How to find Pulspia',
    addressTitle: 'Address',
    address: 'B-dong 621-8, 190, Soha-ro, Gwangmyeong-si, Gyeonggi-do',
    buildingName: '(Gwangmyeong G Tower)',
    viewOnNaverMap: 'View on Naver Map',
    viewOnMap: 'View Naver Map',
  }
};

// 광명G타워(소하로 190) 좌표. Google 지도는 주소 검색 시 도로(소하로)만 표시하므로 좌표를 사용
const OFFICE_COORDS = '37.445836,126.894198';

const Location = ({ lang }) => {
  const c = content[lang];

  // 네이버 지도 URL (주소 검색)
  const naverMapUrl = 'https://map.naver.com/p/search/경기도 광명시 소하로 190';

  return (
    <section id="location" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* 섹션 제목 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            {c.title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {c.subtitle}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 주소 정보 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 shadow-md">
              <div className="flex items-start mb-6">
                <MapPin className="text-blue-500 mr-3 mt-1" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {c.addressTitle}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-1">
                    {c.address}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {c.buildingName}
                  </p>
                </div>
              </div>

              {/* 지도 */}
              <div className="space-y-4">
                {/* Google Maps 간편 지도 */}
                <div className="rounded-lg overflow-hidden shadow-md">
                  <iframe
                    src={`https://maps.google.com/maps?q=${OFFICE_COORDS}&hl=${lang}&z=17&output=embed`}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Pulspia Location Map"
                  ></iframe>
                </div>

                {/* 네이버 지도 큰 지도 보기 버튼 */}
                <div className="text-center">
                  <a
                    href={naverMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
                  >
                    <MapPin size={20} />
                    {c.viewOnMap}
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
