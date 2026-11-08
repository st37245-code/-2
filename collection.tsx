import React, { useState } from "react";
import { Pressable, View } from "react-native";
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
  Screen,
  SectionTitle,
} from "@/components/primitives";
import { SnakeArt } from "@/components/snake-art";
import { useAppStore } from "@/hooks/app-store";
import { snakes } from "@/lib/content";

type CollectionFilter = "all" | "unlocked" | "secret";

const secretSnakes = snakes.filter((snake) => snake.isSecret);

export default function CollectionScreen() {
  const router = useRouter();
  const { data, isOffline } = useAppStore();
  const [selectedId, setSelectedId] = useState(snakes[0].id);
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const selected = snakes.find((snake) => snake.id === selectedId) ?? snakes[0];
  const isUnlocked = data.unlockedSnakeIds.includes(selected.id);
  const secretUnlocked = data.unlockedSnakeIds.filter((id) =>
    secretSnakes.some((snake) => snake.id === id),
  ).length;
  const remainingRegularCount = snakes.filter(
    (snake) => !snake.isSecret && !data.unlockedSnakeIds.includes(snake.id),
  ).length;
  const remainingSecretCount = secretSnakes.filter(
    (snake) => !data.unlockedSnakeIds.includes(snake.id),
  ).length;
  const secretChanceCopy =
    remainingRegularCount === 0
      ? remainingSecretCount === 0
        ? "ค้นพบครบทั้ง 24 ลายสีแล้ว! เล่นต่อเพื่อสะสม XP"
        : "เก็บลายปกติครบแล้ว ฟักครั้งถัดไปจะสุ่มจากสีซีเคร็ตที่ยังไม่พบ"
      : remainingSecretCount === 0
        ? "ค้นพบสีซีเคร็ตครบแล้ว ไข่จะสุ่มลายปกติที่ยังไม่พบ"
        : "สีซีเคร็ตมีโอกาส 10% ต่อการฟัก ขณะที่ยังมีลายปกติให้สะสม";
  const visibleSnakes = snakes.filter((snake) => {
    if (filter === "unlocked") return data.unlockedSnakeIds.includes(snake.id);
    if (filter === "secret") return snake.isSecret;
    return true;
  });
  const filters: { id: CollectionFilter; label: string }[] = [
    { id: "all", label: `ทั้งหมด ${snakes.length}` },
    { id: "unlocked", label: `พบแล้ว ${data.unlockedSnakeIds.length}` },
    { id: "secret", label: `สีซีเคร็ต ${secretSnakes.length}` },
  ];

  return (
    <Screen>
      {isOffline ? <OfflineBanner /> : null}
      <PageHeader
        title="สมุดเพื่อนงู"
        subtitle="ตัวละครสีสันในโลกนิทาน"
        icon="leaf-outline"
      />
      <Card
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: "#E8F0DF",
        }}
      >
        <View
          style={{
            width: 49,
            height: 49,
            borderRadius: 17,
            backgroundColor: C.paper,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StorybookMascot
            size={46}
            accessibilityLabel="งูน้อยชวนสะสมเพื่อนใหม่"
          />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ color: C.forest, fontWeight: "900", fontSize: 14 }}>
            มีงู 24 ลายสีให้สะสม
          </Text>
          <Text style={{ color: C.muted, fontSize: 11 }}>
            {data.unlockedSnakeIds.length}/{snakes.length} พบแล้ว · สีซีเคร็ต{" "}
            {secretUnlocked}/{secretSnakes.length}
          </Text>
        </View>
      </Card>
      <Card
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 8,
          backgroundColor: "#FFF5D9",
        }}
      >
        <Ionicons name="sparkles" size={17} color="#A77328" />
        <Text style={{ color: C.ink, fontSize: 11, lineHeight: 17, flex: 1 }}>
          ตอบถูกครบ 5 ข้อเพื่อฟักงูแบบสุ่ม · {secretChanceCopy}·
          ลายสีแฟนตาซีเป็นตัวละครในเกม ไม่ใช่สีธรรมชาติที่ยืนยันแล้ว
        </Text>
      </Card>
      <SectionTitle title="สมุดสะสมงู" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {filters.map((item) => {
          const active = filter === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(item.id)}
              style={{
                borderRadius: 99,
                borderWidth: 1.5,
                borderColor: active ? C.forest : C.line,
                backgroundColor: active ? C.leafSoft : C.paper,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  color: active ? C.forest : C.muted,
                  fontSize: 11,
                  fontWeight: "800",
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {visibleSnakes.map((snake) => {
          const unlocked = data.unlockedSnakeIds.includes(snake.id);
          const active = selectedId === snake.id;
          const shownName = unlocked
            ? snake.name
            : snake.isSecret
              ? "???"
              : "ยังไม่ปลดล็อก";
          return (
            <Pressable
              key={snake.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={
                unlocked
                  ? snake.name
                  : snake.isSecret
                    ? "ตัวละครสีซีเคร็ตที่ยังไม่ถูกค้นพบ"
                    : "งูที่ยังไม่ปลดล็อก"
              }
              onPress={() => setSelectedId(snake.id)}
              style={{
                width: "47.5%",
                flexGrow: 1,
                minHeight: 148,
                backgroundColor: active ? "#EFF5E8" : C.paper,
                borderRadius: 20,
                borderWidth: active ? 2 : 1,
                borderColor: active ? C.leaf : C.line,
                padding: 11,
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <View
                style={{
                  height: 74,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: unlocked ? 1 : 0.58,
                }}
              >
                <SnakeArt
                  color={snake.color}
                  accent={snake.accent}
                  variant={snake.pattern}
                  locked={!unlocked}
                  secret={snake.isSecret}
                  size={77}
                />
              </View>
              {!unlocked ? (
                <View
                  style={{
                    position: "absolute",
                    top: 9,
                    right: 9,
                    width: 25,
                    height: 25,
                    borderRadius: 9,
                    backgroundColor: snake.isSecret ? "#FFF0CA" : "#EEF0E8",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={snake.isSecret ? "sparkles" : "lock-closed"}
                    size={13}
                    color={snake.isSecret ? "#A77328" : C.muted}
                  />
                </View>
              ) : null}
              <Text
                numberOfLines={1}
                style={{
                  color: unlocked ? C.ink : C.muted,
                  fontSize: 12,
                  fontWeight: "900",
                  textAlign: "center",
                }}
              >
                {shownName}
              </Text>
              <Text style={{ color: C.muted, fontSize: 10 }}>
                {unlocked
                  ? snake.rarity
                  : snake.isSecret
                    ? "สีซีเคร็ต · ปริศนา"
                    : "ฟักไข่ใบถัดไป"}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {visibleSnakes.length === 0 ? (
        <Card style={{ alignItems: "center", gap: 7 }}>
          <Text style={{ color: C.ink, fontWeight: "900" }}>
            ยังไม่มีงูในหมวดนี้
          </Text>
          <Text style={{ color: C.muted, fontSize: 12 }}>
            เล่นเกมฟักไข่เพื่อเจอเพื่อนใหม่
          </Text>
        </Card>
      ) : null}
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: C.leafSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SnakeArt
              color={isUnlocked ? selected.color : "#C6C9BF"}
              accent={isUnlocked ? selected.accent : "#A5AA9F"}
              variant={selected.pattern}
              size={47}
              locked={!isUnlocked}
              secret={selected.isSecret}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.muted, fontSize: 10 }}>
              {isUnlocked
                ? selected.isSecret
                  ? "พบสีซีเคร็ตแล้ว!"
                  : "เพื่อนในสมุดสะสม"
                : selected.isSecret
                  ? "เพื่อนสีลับที่รอให้ค้นพบ"
                  : "เพื่อนที่รอให้ค้นพบ"}
            </Text>
            <Text style={{ color: C.ink, fontWeight: "900", fontSize: 15 }}>
              {isUnlocked
                ? selected.name
                : selected.isSecret
                  ? "???"
                  : "งูที่ยังไม่ปลดล็อก"}
            </Text>
          </View>
        </View>
        <Text style={{ color: C.muted, fontSize: 12, lineHeight: 19 }}>
          {isUnlocked
            ? selected.fact
            : selected.isSecret
              ? remainingRegularCount === 0
                ? "เก็บลายปกติครบแล้ว สีและชื่อซีเคร็ตที่ยังไม่พบจะสุ่มได้เมื่อฟัก"
                : "สีและชื่อจะเปิดเผยเมื่อฟักพบสีซีเคร็ต · โอกาส 10% ขณะที่ยังมีลายปกติให้สะสม"
              : "ตอบคำถามในเกมให้ถูก 5 ข้อเพื่อฟักไข่และสุ่มพบเพื่อนใหม่"}
        </Text>
        {isUnlocked ? (
          <View
            style={{
              borderRadius: 12,
              backgroundColor: "#FFF0E5",
              padding: 10,
              flexDirection: "row",
              gap: 7,
              alignItems: "flex-start",
            }}
          >
            <Ionicons name="alert-circle-outline" size={15} color="#A45E3B" />
            <Text
              style={{
                color: "#8A563E",
                fontSize: 10,
                lineHeight: 16,
                flex: 1,
              }}
            >
              {selected.safety} · ลายสีพิเศษเป็นจินตนาการในเกม
              ไม่ใช่สีธรรมชาติที่ยืนยันแล้ว
            </Text>
          </View>
        ) : null}
        <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16 }}>
          งูสะสมเป็นตัวละครเพื่อการเรียนรู้ทั่วไป
          ไม่ใช่บัญชีชนิดงูที่สำรวจพบในอุทยานเขางู
        </Text>
      </Card>
      <ActionButton
        label="เล่นเกมฟักไข่"
        icon="egg-outline"
        onPress={() => router.push("/(tabs)/game")}
      />
    </Screen>
  );
}
