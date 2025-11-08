import { Card, Skeleton, Tag } from "antd";
import { useGetAllResultsByAccountQuery } from "../../../services/placementtest.services";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QuizIcon from "@mui/icons-material/Quiz";

const PlacementHistoryPage = () => {
  const userId = useSelector((state: RootState) => state.user.id);

  // ✅ chỉ khai báo 1 lần
  const { data: results, isLoading, refetch } = useGetAllResultsByAccountQuery(userId, {
    refetchOnMountOrArgChange: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-pink-50 py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 mb-2">
          Lịch sử làm bài test
        </h1>
        <p className="text-gray-600 text-lg">Xem lại các bài test bạn đã thực hiện 🎯</p>
      </div>

      {isLoading ? (
        <Skeleton active />
      ) : results?.length ? (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {results.map((r: any) => (
            <Card
              key={r.resultId}
              className="rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-none bg-white/90 backdrop-blur"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <QuizIcon className="text-purple-600" />
                {r.title}
              </h2>
              <p className="text-gray-500 mb-4">{r.fieldName}</p>

              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <EmojiEventsIcon className="text-yellow-500" />
                  <span>{r.score.toFixed(0)} Điểm – Level {r.level}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <AccessTimeIcon fontSize="small" />
                  {new Date(r.completedAt).toLocaleString()}
                </div>
              </div>

              <Tag color="purple">Test #{r.placementTestId}</Tag>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">
          Bạn chưa có lịch sử làm bài test nào.
        </p>
      )}
    </div>
  );
};

export default PlacementHistoryPage;
