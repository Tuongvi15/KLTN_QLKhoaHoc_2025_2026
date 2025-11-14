// src/pages/TeacherPages/ReviewCourseTeacher.tsx
import React, { useMemo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Skeleton,
  Typography,
  Button,
  message,
  Tag,
  Row,
  Col,
  Divider,
  Collapse,
  List,
  Space,
  Badge,
  Switch,
} from "antd";
import { SendOutlined, BookOutlined, PlayCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useGetCourseIDQuery, usePublishCourseMutation } from "../../services/course.services";
import { useGetQuizDetailQuery } from "../../services/quiz.services";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

/** Safe parse for description (handles DraftJS raw, string, object) */
function parseDescription(desc: any): string {
  if (!desc && desc !== 0) return "";
  if (typeof desc === "string") {
    try {
      const parsed = JSON.parse(desc);
      if (parsed && Array.isArray(parsed.blocks)) {
        return parsed.blocks.map((b: any) => b.text || "").join("\n\n");
      }
      if (parsed && typeof parsed === "object" && parsed.text) return String(parsed.text);
      return desc;
    } catch {
      return desc;
    }
  }
  if (typeof desc === "object") {
    if (Array.isArray(desc.blocks)) return desc.blocks.map((b: any) => b.text || "").join("\n\n");
    if (desc.text) return String(desc.text);
    try {
      return JSON.stringify(desc);
    } catch {
      return String(desc);
    }
  }
  return String(desc);
}

/** Helper: safe category display name */
function getCategoryDisplayName(c: any): string {
  if (!c) return "";
  if (typeof c === "string") return c;
  return c.name ?? c.categoryName ?? c.category?.name ?? (c.category?.catgoryId ? String(c.category?.name ?? c.category?.catgoryId) : JSON.stringify(c));
}

/** Quiz preview (always visible; no locking) */
const QuizPreview: React.FC<{ quizId: number }> = ({ quizId }) => {
  const { data: quiz, isLoading } = useGetQuizDetailQuery(quizId, { skip: !quizId || quizId === 1 });

  if (!quizId || quizId === 1) return <Text type="secondary">Không có quiz</Text>;
  if (isLoading) return <Text>Đang tải quiz…</Text>;
  if (!quiz) return <Text type="danger">Không thể tải quiz</Text>;

  return (
    <div style={{ marginTop: 8 }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <Text strong>Quiz:</Text> <Text>{quiz.title}</Text>
        </div>

        {Array.isArray(quiz.questions) && quiz.questions.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={quiz.questions}
            renderItem={(q: any, idx) => {
              const raw = q.anwser ?? "";
              const answers = String(raw)
                .split("|")
                .map((a) => a.trim())
                .filter((a) => a !== "");
              const correctIndex = Number(q.correctAnwser) ?? 0;

              return (
                <List.Item key={q.questionId ?? idx}>
                  <div>
                    <Text strong>{idx + 1}. </Text>
                    <Text>{q.questionTitle ?? "(Chưa có nội dung câu hỏi)"}</Text>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    {answers.length ? (
                      <List
                        size="small"
                        dataSource={answers}
                        renderItem={(ans, aidx) => (
                          <List.Item>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              {aidx === correctIndex ? <Badge status="success" /> : <Badge status="default" />}
                              <Text style={aidx === correctIndex ? { fontWeight: 700 } : undefined}>
                                {String.fromCharCode(65 + aidx)}. {ans}
                              </Text>
                            </div>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Text type="secondary">Không có đáp án (raw: {String(raw)})</Text>
                    )}

                    <div style={{ marginTop: 6 }}>
                      <Text type="secondary">Đáp án đúng (index): {String(q.correctAnwser ?? "—")}</Text>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <Text type="secondary">Chưa có câu hỏi trong quiz này</Text>
        )}
      </Space>
    </div>
  );
};

export default function ReviewCourseTeacher(): JSX.Element {
  // ---------- Hooks (all up front) ----------
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, isError, refetch } = useGetCourseIDQuery(id ?? "");
  const [publishCourse, { isLoading: isPublishing }] = usePublishCourseMutation();

  // local switch state for optional manual UI (not required), sync with backend course value
  const [isActiveToggle, setIsActiveToggle] = useState<boolean>(() => !!(course?.courseIsActive));
  useEffect(() => {
    if (course) setIsActiveToggle(!!course.courseIsActive);
  }, [course?.courseIsActive]);
  // -------------------------------------------------------------------

  const parsedDescription = useMemo(() => parseDescription(course?.description), [course?.description]);

  if (isLoading) return <Skeleton active />;

  if (!course) {
    return (
      <Card style={{ margin: 24 }}>
        <Text type="danger">{isError ? "Lỗi khi tải khóa học" : "Không tìm thấy khóa học"}</Text>
      </Card>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <Card bordered={false} className="mb-6">
        <Row gutter={16} align="middle">
          <Col xs={24} lg={6}>
            {course.imageUrl ? (
              <img src={course.imageUrl} alt={course.title} style={{ width: "100%", borderRadius: 12, objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: 160, borderRadius: 12, background: "#f1f5f9" }} />
            )}
          </Col>

          <Col xs={24} lg={18}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <BookOutlined style={{ fontSize: 28, color: "#1677ff" }} />
              <Title level={3} style={{ margin: 0 }}>{course.title}</Title>
              {course.isPublic ? <Tag color="green">Đã xuất bản</Tag> : <Tag color="red">Chưa xuất bản</Tag>}
            </div>

            {parsedDescription ? <Paragraph ellipsis={{ rows: 3, expandable: true }}>{parsedDescription}</Paragraph> : <Paragraph type="secondary">Không có mô tả</Paragraph>}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              {(course.courseCategories ?? course.courseCategories ?? []).length > 0 ? (
                (course.courseCategories ?? course.courseCategories ?? []).map((c: any, idx: number) => (
                  <Tag key={c.categoryId ?? c.catgoryId ?? idx} color="blue">{getCategoryDisplayName(c.category ?? c)}</Tag>
                ))
              ) : (
                <Text type="secondary">Chưa có danh mục</Text>
              )}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              {typeof course.price === "number" ? (<div><Text strong>Giá:</Text> <Text>{course.price.toLocaleString()} ₫</Text></div>) : null}
              {course.salesCampaign != null ? (<div><Text strong>Giảm:</Text> <Text>{course.salesCampaign}</Text></div>) : null}
              <div><Text strong>Trạng thái hoạt động:</Text> <Text>{course.courseIsActive ? "Hoạt động" : "Tạm ẩn"}</Text></div>
            </div>
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* Sections */}
      {Array.isArray(course.sections) && course.sections.length > 0 ? (
        course.sections.map((section: any, sIdx: number) => (
          <Card key={section.sectionId ?? sIdx} title={`Chương ${sIdx + 1}: ${section.title || "(Chưa đặt tên)"}`} className="mb-4" bordered>
            <Collapse accordion expandIconPosition="end" defaultActiveKey={section.steps && section.steps.length ? [`step-${section.steps[0].stepId ?? 0}`] : []}>
              {Array.isArray(section.steps) && section.steps.length > 0 ? (
                section.steps.map((step: any, idx: number) => {
                  const stepDesc = parseDescription(step.stepDescription ?? step.description ?? "");
                  const hasVideo = !!step.videoUrl && String(step.videoUrl).length > 10;
                  const hasQuiz = !!step.quizId && Number(step.quizId) > 1;

                  const panelHeader = (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div>
                          <Text strong>Bài {idx + 1}:</Text> <Text>{step.title || "(Chưa đặt tên bài)"}</Text>
                        </div>

                        {hasVideo && <Tag color="purple" style={{ marginLeft: 8 }}><PlayCircleOutlined /> Video</Tag>}
                        {hasQuiz && <Tag color="blue" style={{ marginLeft: 8 }}><QuestionCircleOutlined /> Quiz</Tag>}
                      </div>

                      <div style={{ color: "#6b7280", fontSize: 13 }}>
                        <span style={{ marginRight: 12 }}>Vị trí: {step.position ?? idx + 1}</span>
                        {step.duration ? <span>Thời lượng: {step.duration}s</span> : null}
                      </div>
                    </div>
                  );

                  return (
                    <Panel header={panelHeader} key={`step-${step.stepId ?? idx}`}>
                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>Mô tả:</Text>
                            {stepDesc ? <Paragraph ellipsis={{ rows: 4, expandable: true }}>{stepDesc}</Paragraph> : <div><Text type="secondary">Không có mô tả bài</Text></div>}
                          </div>

                          {hasVideo && (
                            <div style={{ marginTop: 8 }}>
                              <Text strong>Nội dung Video:</Text>
                              <div style={{ marginTop: 8 }}>
                                <video controls src={step.videoUrl} style={{ width: "100%", maxWidth: 720, borderRadius: 8 }} />
                              </div>
                            </div>
                          )}

                          {hasQuiz && (
                            <div style={{ marginTop: 12 }}>
                              <Text strong>Nội dung Quiz:</Text>
                              <QuizPreview quizId={Number(step.quizId)} />
                            </div>
                          )}

                          {!hasVideo && !hasQuiz && <Text type="secondary">Chưa có nội dung (video/quiz)</Text>}
                        </div>

                        <div style={{ width: 240 }}>
                          <Card size="small" bordered>
                            <Space direction="vertical" style={{ width: "100%" }}>
                              <div><Text type="secondary">StepId:</Text> <div>{String(step.stepId ?? "-")}</div></div>
                              <div><Text type="secondary">QuizId:</Text> <div>{String(step.quizId ?? "-")}</div></div>
                              <div><Text type="secondary">Position:</Text> <div>{step.position ?? idx + 1}</div></div>
                              {step.duration ? <div><Text type="secondary">Duration:</Text> <div>{step.duration}s</div></div> : null}
                            </Space>
                          </Card>
                        </div>
                      </div>
                    </Panel>
                  );
                })
              ) : (
                <div className="p-4 text-gray-500">Chưa có bài học trong chương này.</div>
              )}
            </Collapse>
          </Card>
        ))
      ) : (
        <Card bordered className="mb-4"><Text type="secondary">Khóa học chưa có chương nào.</Text></Card>
      )}

      <Divider />

      {/* Action: gửi duyệt tới Admin */}
      {!course.isPublic && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, gap: 12 }}>
          {/* optional switch to set courseIsActive also (kept for convenience) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text type="secondary">Kích hoạt</Text>
            <Switch checked={isActiveToggle} disabled onChange={(v) => setIsActiveToggle(v)} />
          </div>

          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={isPublishing}
            onClick={async () => {
              try {
                // call publish API to set courseIsActive = true (and optionally isActiveToggle)
                await publishCourse({ courseId: Number(course.courseId ?? course.courseId ?? course.courseId), isActive: true } as any).unwrap();
                message.success("Đã gửi yêu cầu xuất bản đến Admin");
                // refresh data
                refetch?.();
              } catch (err) {
                console.error(err);
                message.error("Gửi yêu cầu xuất bản thất bại");
              }
            }}
          >
            Gửi tới Admin
          </Button>
        </div>
      )}

      <div style={{ height: 32 }} />
    </div>
  );
}
