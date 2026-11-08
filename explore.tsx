import React, { useMemo, useState } from "react";
import { Image, Linking, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StorybookMascot } from "@/components/storybook-art";

import { ScaledText as Text } from "@/components/scaled-text";
import {
  ActionButton,
  C,
  Card,
  OfflineBanner,
  PageHeader,
  Pill,
  Screen,
  SearchField,
  SectionTitle,
} from "@/components/primitives";
import { useAppStore } from "@/hooks/app-store";
import { lessons, parkPhotos } from "@/lib/content";

const lessonFilters = ["ทั้งหมด", "เรื่องราว", "มรดก", "ธรรมชาติ"] as const;
type LessonFilter = (typeof lessonFilters)[number];

export default function ExploreScreen() {
  const router = useRouter();
  const { data, isOffline, markLessonLearned } = useAppStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LessonFilter>("ทั้งหมด");
  const visibleLessons = useMemo(
    () =>
      lessons.filter((lesson) => {
        const text =
          `${lesson.title} ${lesson.tag} ${lesson.body}`.toLocaleLowerCase();
        const matchesQuery = text.includes(query.trim().toLocaleLowerCase());
        const matchesFilter =
          filter === "ทั้งหมด" ||
          (filter === "เรื่องราว" && lesson.id === "quarry") ||
          (filter === "มรดก" && lesson.id === "caves") ||
          (filter === "ธรรมชาติ" && lesson.id === "nature");
        return matchesQuery && matchesFilter;
      }),
    [query, filter],
  );

  return (
    <Screen>
      {isOffline ? <OfflineBanner /> : null}
      <PageHeader
        title="ออกสำรวจเขางู"
        subtitle="สมุดนักสำรวจ · เรียนรู้จากสถานที่จริง"
        icon="compass-outline"
      />
      <View
        style={{
          borderRadius: 22,
          backgroundColor: "#E8F0DF",
          padding: 17,
          flexDirection: "row",
          gap: 12,
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={{ color: C.forest, fontWeight: "900", fontSize: 17 }}>
            พร้อมค้นพบเรื่องใหม่ไหม?
          </Text>
          <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18 }}>
            อ่านทีละบท ดูภาพจริง แล้วไปเลือกจุดสนใจบนแผนที่
          </Text>
        </View>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 17,
            backgroundColor: C.paper,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StorybookMascot size={48} accessibilityLabel="งูน้อยชวนค้นพบเรื่องใหม่" />
        </View>
      </View>
      <SectionTitle
        title="เส้นทางเรียนรู้"
        action="ดูภาพจริง"
        onAction={() => router.push("/gallery")}
      />
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="ค้นหาบทเรียน"
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {lessonFilters.map((item) => (
          <Pill
            key={item}
            label={item}
            selected={filter === item}
            onPress={() => setFilter(item)}
          />
        ))}
      </View>
      {visibleLessons.length === 0 ? (
        <Card style={{ alignItems: "center", gap: 9, paddingVertical: 23 }}>
          <Ionicons name="search-outline" size={25} color={C.forest} />
          <Text style={{ color: C.ink, fontSize: 15, fontWeight: "900" }}>
            ไม่พบบทเรียนที่ตรงกัน
          </Text>
          <Text style={{ color: C.muted, fontSize: 12, textAlign: "center" }}>
            ลองคำค้นอื่น หรือดูบทเรียนทั้งหมดอีกครั้ง
          </Text>
          <ActionButton
            label="ล้างการค้นหาและตัวกรอง"
            icon="refresh"
            small
            tone="soft"
            onPress={() => {
              setQuery("");
              setFilter("ทั้งหมด");
            }}
          />
        </Card>
      ) : (
        visibleLessons.map((lesson, index) => {
          const learned = data.learnedLessonIds.includes(lesson.id);
          return (
            <Card key={lesson.id} style={{ gap: 11 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 16,
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
                  <Text style={{ fontSize: 23 }}>{lesson.icon}</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text
                    style={{ color: C.muted, fontSize: 10, fontWeight: "800" }}
                  >
                    {lesson.tag}
                  </Text>
                  <Text
                    style={{
                      color: C.ink,
                      fontWeight: "900",
                      fontSize: 16,
                      lineHeight: 22,
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
              <Text style={{ color: C.muted, fontSize: 13, lineHeight: 21 }}>
                {lesson.body}
              </Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => Linking.openURL(lesson.sourceUrl)}
                style={{
                  flexDirection: "row",
                  gap: 5,
                  alignItems: "center",
                  alignSelf: "flex-start",
                }}
              >
                <Ionicons name="link-outline" size={13} color={C.forest} />
                <Text
                  style={{ color: C.forest, fontSize: 10, fontWeight: "700" }}
                >
                  ที่มา: {lesson.sourceLabel}
                </Text>
              </Pressable>
              <ActionButton
                label={
                  learned
                    ? "อ่านแล้ว · ได้รับ 8 XP"
                    : "ทำเครื่องหมายว่าอ่านแล้ว"
                }
                icon={learned ? "checkmark" : "book-outline"}
                tone={learned ? "soft" : "primary"}
                small
                disabled={learned}
                onPress={() => markLessonLearned(lesson.id)}
              />
            </Card>
          );
        })
      )}
      <View style={{ gap: 10 }}>
        <SectionTitle
          title="ภาพจากสถานที่จริง"
          action="ดูทั้งหมด"
          onAction={() => router.push("/gallery")}
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          {parkPhotos.slice(0, 2).map((photo) => (
            <Pressable
              key={photo.id}
              accessibilityRole="button"
              onPress={() => router.push("/gallery")}
              style={{
                flex: 1,
                height: 120,
                borderRadius: 18,
                overflow: "hidden",
                backgroundColor: C.leafSoft,
              }}
            >
              <Image
                source={photo.image}
                resizeMode="cover"
                style={{ width: "100%", height: "100%" }}
                accessibilityLabel={photo.title}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 8,
                  backgroundColor: "rgba(28,49,34,0.72)",
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ color: C.white, fontSize: 11, fontWeight: "800" }}
                >
                  {photo.title}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
      <Card style={{ gap: 9, backgroundColor: "#F1F1DF" }}>
        <Text style={{ color: C.forest, fontWeight: "900", fontSize: 15 }}>
          ต่อไป ไปดูแผนที่กัน
        </Text>
        <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18 }}>
          จุดบนแผนที่เป็นแผนผังจำลองสำหรับการเรียนรู้ ไม่ใช่เส้นทางสำรวจจริง
        </Text>
        <ActionButton
          label="เปิดแผนที่อุทยาน"
          icon="map-outline"
          tone="soft"
          onPress={() => router.push("/map")}
        />
      </Card>
    </Screen>
  );
}
