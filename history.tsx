import React from "react";
import { Linking, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { ScaledText as Text } from "@/components/scaled-text";
import {
  ActionButton,
  BackHeader,
  C,
  Card,
  OfflineBanner,
  Screen,
} from "@/components/primitives";
import { useAppStore } from "@/hooks/app-store";
import { lessons } from "@/lib/content";

export default function HistoryScreen() {
  const router = useRouter();
  const { data, isOffline, markLessonLearned } = useAppStore();
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/(tabs)/explore");
  return (
    <Screen>
      <BackHeader title="เรื่องราวเขางู" onBack={back} />
      {isOffline ? <OfflineBanner /> : null}
      <View
        style={{
          borderRadius: 22,
          padding: 19,
          backgroundColor: C.forest,
          gap: 8,
        }}
      >
        <Text style={{ color: "#DDEECE", fontSize: 11, fontWeight: "800" }}>
          เดินทางผ่านกาลเวลา
        </Text>
        <Text
          style={{
            color: C.white,
            fontSize: 23,
            fontWeight: "900",
            lineHeight: 30,
          }}
        >
          หินเก่าเล่าเรื่อง{"\n"}ผู้คนและธรรมชาติ
        </Text>
        <Text style={{ color: "#E6F0E4", fontSize: 12, lineHeight: 19 }}>
          อ่านสั้น ๆ ทีละบท แล้วเก็บดาวความรู้ของเราไว้ในสมุด
        </Text>
      </View>
      <View style={{ gap: 13 }}>
        {lessons.map((lesson, index) => {
          const learned = data.learnedLessonIds.includes(lesson.id);
          return (
            <Card key={lesson.id} style={{ gap: 12 }}>
              <View
                style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 15,
                    backgroundColor:
                      index === 0
                        ? "#E5F0D8"
                        : index === 1
                          ? "#F6EAD5"
                          : "#DDEFEA",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 21 }}>{lesson.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: C.muted, fontSize: 10, fontWeight: "800" }}
                  >
                    บทที่ {index + 1} · {lesson.tag}
                  </Text>
                  <Text
                    style={{
                      color: C.ink,
                      fontSize: 16,
                      fontWeight: "900",
                      marginTop: 2,
                    }}
                  >
                    {lesson.title}
                  </Text>
                </View>
                {learned ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={21}
                    color={C.forest}
                  />
                ) : null}
              </View>
              <Text style={{ color: C.muted, fontSize: 13, lineHeight: 22 }}>
                {lesson.body}
              </Text>
              <View
                style={{
                  backgroundColor: "#F3F5EC",
                  padding: 11,
                  borderRadius: 13,
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <Ionicons name="bulb-outline" size={15} color="#AE7D2F" />
                <Text
                  style={{
                    color: C.forestDark,
                    fontSize: 11,
                    lineHeight: 17,
                    flex: 1,
                  }}
                >
                  {index === 0
                    ? "ชวนคิด: ทำไมเราจึงควรดูแลภูเขาหินและพื้นที่รอบ ๆ ให้ยั่งยืน?"
                    : index === 1
                      ? "ชวนคิด: ร่องรอยในถ้ำบอกอะไรเกี่ยวกับผู้คนในอดีตได้บ้าง?"
                      : "ชวนคิด: การชมสัตว์ป่าอย่างไม่รบกวนช่วยธรรมชาติอย่างไร?"}
                </Text>
              </View>
              <Text
                onPress={() => Linking.openURL(lesson.sourceUrl)}
                accessibilityRole="link"
                style={{ color: C.forest, fontSize: 10, fontWeight: "700" }}
              >
                แหล่งข้อมูล: {lesson.sourceLabel} ↗
              </Text>
              <ActionButton
                label={learned ? "บันทึกแล้ว · 8 XP" : "อ่านจบแล้ว"}
                icon={learned ? "checkmark" : "sparkles"}
                tone={learned ? "soft" : "primary"}
                small
                disabled={learned}
                onPress={() => markLessonLearned(lesson.id)}
              />
            </Card>
          );
        })}
      </View>
      <ActionButton
        label="ดูภาพสถานที่จริง"
        icon="images-outline"
        tone="soft"
        onPress={() => router.push("/gallery")}
      />
    </Screen>
  );
}
