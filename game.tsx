import React, { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Ellipse, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { StorybookMascot } from "@/components/storybook-art";

import { ScaledText as Text } from "@/components/scaled-text";
import {
  ActionButton,
  C,
  Card,
  OfflineBanner,
  PageHeader,
  Screen,
} from "@/components/primitives";
import { SnakeArt } from "@/components/snake-art";
import { useAppStore } from "@/hooks/app-store";
import { quizQuestions, snakes } from "@/lib/content";

function Egg({ progress }: { progress: number }) {
  const shell = progress >= 4 ? "#F1D08D" : "#FFF0CF";
  return (
    <Svg
      width={106}
      height={124}
      viewBox="0 0 100 120"
      accessibilityLabel="ไข่งูที่กำลังฟัก"
    >
      <Ellipse cx="50" cy="108" rx="34" ry="8" fill="#8E6747" opacity="0.12" />
      <Path
        d="M50 9 C72 9 86 43 85 73 C84 98 70 108 50 108 C30 108 16 98 15 73 C14 43 28 9 50 9Z"
        fill={shell}
        stroke="#9B6946"
        strokeWidth="3.5"
      />
      <Path
        d={
          progress > 0
            ? `M47 13 L44 35 L56 44 L47 59 L58 71`
            : "M29 54 Q34 47 39 54 M61 54 Q66 47 71 54"
        }
        fill="none"
        stroke="#B77949"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {progress >= 4 ? (
        <>
          <Ellipse cx="50" cy="74" rx="23" ry="18" fill="#F7E5B9" />
          <CircleForEgg />
        </>
      ) : null}
    </Svg>
  );
}

function CircleForEgg() {
  return (
    <Path
      d="M37 77 Q50 89 63 77"
      fill="none"
      stroke="#C79B50"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  );
}

export default function GameScreen() {
  const router = useRouter();
  const { data, isOffline, answerQuiz } = useAppStore();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [hatchedId, setHatchedId] = useState<string | null>(null);
  const question = quizQuestions[questionIndex % quizQuestions.length];
  const hatchedSnake = snakes.find((snake) => snake.id === hatchedId);

  const check = () => {
    if (choice === null || feedback) return;
    const correct = choice === question.answer;
    const newlyHatched = answerQuiz(correct);
    setFeedback(correct ? "correct" : "wrong");
    if (newlyHatched) setHatchedId(newlyHatched);
  };
  const nextQuestion = () => {
    if (feedback === "wrong") return (setFeedback(null), setChoice(null));
    setQuestionIndex((current) => current + 1);
    setChoice(null);
    setFeedback(null);
  };
  const eggProgress = data.hatchProgress;
  const remainingRegularCount = snakes.filter(
    (snake) => !snake.isSecret && !data.unlockedSnakeIds.includes(snake.id),
  ).length;
  const remainingSecretCount = snakes.filter(
    (snake) => snake.isSecret && !data.unlockedSnakeIds.includes(snake.id),
  ).length;
  const allSnakesFound = remainingRegularCount + remainingSecretCount === 0;
  const hatchInfoCopy = allSnakesFound
    ? "ค้นพบครบทั้ง 24 ลายสีแล้ว · ตอบต่อเพื่อสะสม XP"
    : remainingRegularCount === 0
      ? "เก็บลายปกติครบแล้ว · ไข่ต่อไปจะสุ่มจากสีซีเคร็ตที่ยังไม่พบ"
      : remainingSecretCount === 0
        ? "พบสีซีเคร็ตครบแล้ว · ไข่สุ่มลายปกติที่ยังไม่พบ"
        : "สีซีเคร็ตมีโอกาส 10% ต่อการฟัก ขณะที่ยังมีลายปกติให้สะสม";

  return (
    <Screen>
      {isOffline ? (
        <OfflineBanner message="ออฟไลน์อยู่ — เกมและความคืบหน้าเล่นต่อได้" />
      ) : null}
      <PageHeader
        title="เกมฟักไข่งู"
        subtitle="ตอบคำถาม · เติมพลัง · พบเพื่อนใหม่"
        icon="egg-outline"
      />
      <Card style={{ alignItems: "center", gap: 6, paddingVertical: 16 }}>
        <Text style={{ color: C.forest, fontSize: 13, fontWeight: "900" }}>
          {allSnakesFound ? "เก็บครบทุกลายสีแล้ว!" : "ไข่ใบถัดไปกำลังอุ่นอยู่"}
        </Text>
        <Egg progress={eggProgress} />
        <View style={{ flexDirection: "row", gap: 6, marginTop: 1 }}>
          {[0, 1, 2, 3, 4].map((step) => (
            <View
              key={step}
              style={{
                width: 33,
                height: 7,
                borderRadius: 9,
                backgroundColor: step < eggProgress ? C.leaf : "#E9EBDD",
              }}
            />
          ))}
        </View>
        <Text style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>
          {eggProgress}/5 คำตอบถูก · {data.unlockedSnakeIds.length}/
          {snakes.length} ลายสีที่พบ
        </Text>
        <Text style={{ color: C.muted, fontSize: 10, textAlign: "center" }}>
          {hatchInfoCopy}
        </Text>
      </Card>

      <Card style={{ gap: 14 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              borderRadius: 99,
              paddingHorizontal: 10,
              paddingVertical: 5,
              backgroundColor: C.leafSoft,
            }}
          >
            <Text style={{ color: C.forest, fontSize: 10, fontWeight: "900" }}>
              คำถาม {questionIndex + 1}
            </Text>
          </View>
          <Text style={{ color: C.muted, fontSize: 10 }}>ตอบถูกได้ +10 XP</Text>
        </View>
        <Text
          accessibilityRole="header"
          style={{
            color: C.ink,
            fontSize: 18,
            fontWeight: "900",
            lineHeight: 26,
          }}
        >
          {question.prompt}
        </Text>
        <View style={{ gap: 8 }}>
          {question.options.map((option, index) => {
            const isSelected = choice === index;
            const isAnswer = feedback === "wrong" && index === question.answer;
            const isWrong =
              feedback === "wrong" && isSelected && index !== question.answer;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                disabled={!!feedback}
                onPress={() => setChoice(index)}
                style={{
                  minHeight: 50,
                  paddingHorizontal: 13,
                  borderRadius: 15,
                  borderWidth: 1.5,
                  borderColor:
                    feedback === "correct" && isSelected
                      ? C.forest
                      : isAnswer
                        ? C.forest
                        : isWrong
                          ? "#D47C70"
                          : isSelected
                            ? C.forest
                            : C.line,
                  backgroundColor:
                    feedback === "correct" && isSelected
                      ? C.leafSoft
                      : isAnswer
                        ? C.leafSoft
                        : isWrong
                          ? "#FFF0EA"
                          : isSelected
                            ? "#EFF4E7"
                            : C.paper,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 1.5,
                    borderColor: isSelected || isAnswer ? C.forest : "#C7D1C4",
                    backgroundColor:
                      isSelected || isAnswer ? C.forest : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: isSelected || isAnswer ? C.white : C.muted,
                      fontSize: 10,
                      fontWeight: "900",
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text
                  style={{
                    color: C.ink,
                    fontSize: 13,
                    fontWeight: isSelected || isAnswer ? "800" : "600",
                    flex: 1,
                  }}
                >
                  {option}
                </Text>
                {feedback === "correct" && isSelected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={C.forest}
                  />
                ) : null}
                {isAnswer ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={C.forest}
                  />
                ) : isWrong ? (
                  <Ionicons name="close-circle" size={18} color={C.red} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
        {feedback ? (
          <View
            style={{
              padding: 11,
              borderRadius: 13,
              backgroundColor: feedback === "correct" ? C.leafSoft : "#FFF0EA",
              flexDirection: "row",
              gap: 7,
              alignItems: "flex-start",
            }}
          >
            <Ionicons
              name={feedback === "correct" ? "sparkles" : "bulb-outline"}
              size={16}
              color={feedback === "correct" ? C.forest : C.red}
            />
            <Text
              style={{
                color: feedback === "correct" ? C.forest : "#8E4F47",
                fontSize: 12,
                lineHeight: 18,
                flex: 1,
              }}
            >
              {feedback === "correct"
                ? allSnakesFound
                  ? "ตอบถูกแล้ว! เก็บครบ 24 ลายสี รับ XP สะสมต่อได้เลย"
                  : "ตอบถูกแล้ว! ไข่ได้รับพลังเพิ่ม 1 หน่วย"
                : `ยังไม่ใช่คำตอบนี้นะ · คำใบ้: ${question.hint}`}
            </Text>
          </View>
        ) : null}
        {feedback ? (
          <ActionButton
            label={feedback === "wrong" ? "ลองตอบอีกครั้ง" : "คำถามถัดไป"}
            icon={feedback === "wrong" ? "refresh" : "arrow-forward"}
            onPress={nextQuestion}
          />
        ) : (
          <ActionButton
            label="ตรวจคำตอบ"
            icon="checkmark"
            disabled={choice === null}
            onPress={check}
          />
        )}
      </Card>
      <Card
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: "#FFF6DF",
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: C.orangeSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StorybookMascot
            size={42}
            accessibilityLabel="งูน้อยชวนเล่นอย่างอ่อนโยน"
          />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ color: C.ink, fontSize: 12, fontWeight: "900" }}>
            เล่นอย่างอ่อนโยน
          </Text>
          <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16 }}>
            งูในเกมเป็นตัวละครเรียนรู้ทั่วไป
            ไม่ใช่การยืนยันว่างูทุกชนิดอยู่ในอุทยาน การฟักไข่เป็นเกมจำลอง
          </Text>
        </View>
      </Card>
      <ActionButton
        label="ดูคอลเลกชันงู"
        icon="leaf-outline"
        tone="soft"
        onPress={() => router.push("/(tabs)/collection")}
      />

      <Modal
        visible={!!hatchedSnake}
        transparent
        animationType={data.settings.reduceMotion ? "none" : "fade"}
        onRequestClose={() => setHatchedId(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(24,45,32,0.62)",
            justifyContent: "center",
            alignItems: "center",
            padding: 22,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 370,
              borderRadius: 26,
              backgroundColor: C.paper,
              padding: 24,
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 28,
                backgroundColor: C.leafSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SnakeArt
                color={hatchedSnake?.color}
                accent={hatchedSnake?.accent}
                variant={hatchedSnake?.pattern}
                size={80}
                secret={hatchedSnake?.isSecret}
              />
            </View>
            <Text style={{ color: C.forest, fontSize: 23, fontWeight: "900" }}>
              ฟักสำเร็จแล้ว!
            </Text>
            {hatchedSnake?.isSecret ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: 99,
                  backgroundColor: "#FFF0C5",
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                }}
              >
                <Ionicons name="sparkles" size={16} color="#A77328" />
                <Text
                  style={{ color: "#8B6124", fontSize: 12, fontWeight: "900" }}
                >
                  ว้าว! พบสีซีเคร็ตแล้ว
                </Text>
              </View>
            ) : null}
            <Text style={{ color: C.ink, fontSize: 18, fontWeight: "900" }}>
              {hatchedSnake?.name}
            </Text>
            <Text
              style={{
                color: C.muted,
                fontSize: 12,
                lineHeight: 19,
                textAlign: "center",
              }}
            >
              {hatchedSnake?.fact}
            </Text>
            <ActionButton
              label="ดูในคอลเลกชัน"
              icon="leaf-outline"
              onPress={() => {
                setHatchedId(null);
                router.push("/(tabs)/collection");
              }}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setHatchedId(null)}
              style={{ padding: 6 }}
            >
              <Text style={{ color: C.muted, fontSize: 12, fontWeight: "700" }}>
                เล่นต่อ
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
