import { Card, Skeleton, Modal, Button } from "antd";
import { useGetAllResultsByAccountQuery } from "../../../services/placementtest.services";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useState } from "react";

import QuizIcon from "@mui/icons-material/Quiz";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CategoryIcon from "@mui/icons-material/Category";
import ReplayIcon from "@mui/icons-material/Replay";

import { useNavigate } from "react-router-dom";

const PlacementHistoryPage = () => {
  const userId = useSelector((state: RootState) => state.user.id);
  const navigate = useNavigate();

  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestData, setSuggestData] = useState<any>(null);

  // ----- CHỈ CÓ 1 isLoading -----
  const { data: results, isLoading } = useGetAllResultsByAccountQuery(userId, {
    refetchOnMountOrArgChange: true,
  });

  // ----- FETCH API GỢI Ý KHI CLICK NÚT -----
  const handleOpenSuggest = async (resultId: number) => {
    const res = await fetch(
      `https://localhost:7005/api/PlacementTest/results/suggestion-by-result/${resultId}`
    ).then(r => r.json());

    setSuggestData(res);
    setShowSuggest(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-pink-50 py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 mb-2">
          Lịch sử làm bài test
        </h1>
        <p className="text-gray-600 text-lg mt-3">
          Xem lại những bài test bạn đã hoàn thành 🎯
        </p>
      </div>

      {isLoading ? (
        <Skeleton active />
      ) : results?.length ? (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">

          {results.map((r: any) => (
            <Card
              key={r.resultId}
              className="rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-none bg-white/95 backdrop-blur-sm"
              bodyStyle={{ padding: "24px" }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <QuizIcon className="text-purple-600 text-3xl" />
                {r.title}
              </h2>

              <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                <CategoryIcon className="text-pink-500" />
                <span className="font-medium">{r.categoryName}</span>
              </div>

              {r.description && (
                <p className="text-gray-500 mb-4 text-sm italic">
                  {r.description}
                </p>
              )}

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <EmojiEventsIcon className="text-yellow-500" />
                  <span className="text-lg">
                    {r.score}% • Level {r.level}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <AccessTimeIcon fontSize="small" />
                  {new Date(r.completedAt).toLocaleString("vi-VN")}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-3">
                <Button
                  onClick={() =>
                    navigate(`/placement-test/start/${r.placementTestId}`)
                  }
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl border-none hover:opacity-90 font-medium"
                >
                  <ReplayIcon style={{ fontSize: 18 }} />
                  Làm lại bài test
                </Button>

                <Button
                  onClick={() => handleOpenSuggest(r.resultId)}
                  className="flex items-center justify-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-xl border-none hover:opacity-90 font-medium"
                >
                  Gợi ý khóa học
                </Button>
              </div>
            </Card>
          ))}

        </div>
      ) : (
        <p className="text-center text-gray-500 mt-14 text-lg italic">
          Bạn chưa có lịch sử làm bài test nào.
        </p>
      )}

      {/* POPUP GỢI Ý */}
      <Modal
        open={showSuggest}
        onCancel={() => setShowSuggest(false)}
        footer={null}
        centered
        width={600}
      >
        {suggestData && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-3">
              🎯 Gợi ý khóa học phù hợp
            </h2>

            <p className="text-center text-gray-700 mb-4">
              Level: <b>{suggestData.level}</b> • Điểm: <b>{suggestData.score}%</b>
            </p>

            {suggestData.recommendedCourses?.length ? (
              <div className="grid grid-cols-1 gap-3">
                {suggestData.recommendedCourses.map((c: any) => (
                  <Button
                    key={c.courseId}
                    className="w-full h-12 bg-blue-500 text-white rounded-xl"
                    onClick={() => navigate(`/course/${c.courseId}`)}
                  >
                    Xem khóa học: {c.title}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">Không có khóa học phù hợp.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PlacementHistoryPage;
