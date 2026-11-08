import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ScaledText as Text } from "@/components/scaled-text";
import {
  ActionButton,
  C,
  Card,
  OfflineBanner,
  Screen,
  SectionTitle,
} from "@/components/primitives";
import { useAppStore } from "@/hooks/app-store";
import {
  StorybookDioramaBackground,
  StorybookMascot,
} from "@/components/storybook-art";

function WelcomeCard({
  onStart,
  onLater,
}: {
  onStart: () => void;
  onLater: () => void;
}) {
  return (
    <Card
      style={{ backgroundColor: C.paper, borderColor: C.line, gap: 12 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 25,
            backgroundColor: C.leafSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StorybookMascot size={70} accessibilityLabel="งูน้อยนักสำรวจ" />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            accessibilityRole="header"
            style={{ color: C.forest, fontWeight: "900", fontSize: 17 }}
          >
            สวัสดีนักสำรวจ!
          </Text>
          <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18 }}>
            เรียนรู้ประวัติเขางู ดูภาพจริง หมุนฉากจำลอง และทำภารกิจเพื่อฟักไข่งู
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <ActionButton
            label="เริ่มสำรวจ"
            icon="compass"
            small
            onPress={onStart}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onLater}
          hitSlop={10}
          style={{ paddingHorizontal: 8, paddingVertical: 10 }}
        >
          <Text style={{ color: C.muted, fontSize: 11, fontWeight: "700" }}>
            ซ่อนคำแนะนำ
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { data, isOffline, completeOnboarding, dismissOnboarding, toggleTask } =
    useAppStore();
  const openCount = data.tasks.filter((task) => task.status === "open").length;
  const learnedCount = data.learnedLessonIds.length;
  const progress = Math.min(100, Math.round((learnedCount / 3) * 100));

  return (
    <Screen>
      {isOffline ? <OfflineBanner /> : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              backgroundColor: C.leafSoft,
              overflow: "hidden",
            }}
          >
            <StorybookMascot
              size={46}
              accessibilityLabel="มาสคอตเขางูน่ารู้"
            />
          </View>
          <View>
            <Text style={{ color: C.forest, fontSize: 16, fontWeight: "900" }}>
              เขางูน่ารู้
            </Text>
            <Text style={{ color: C.muted, fontSize: 11 }}>
              สมุดสำรวจของ {data.settings.displayName}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="เปิดการตั้งค่า"
          onPress={() => router.push("/(tabs)/profile")}
          style={{
            width: 42,
            height: 42,
            borderRadius: 15,
            backgroundColor: C.paper,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: C.line,
          }}
        >
          <Ionicons name="settings-outline" size={19} color={C.forest} />
        </Pressable>
      </View>

      <View style={{ gap: 4 }}>
        <Text style={{ color: C.ink, fontSize: 24, fontWeight: "900" }}>
          วันนี้ค้นพบอะไรดี?
        </Text>
        <Text style={{ color: C.muted, fontSize: 13 }}>
          แตะจุดหมาย แล้วออกเดินทางไปด้วยกัน
        </Text>
      </View>
      {data.welcomeVisible ? (
        <WelcomeCard onStart={completeOnboarding} onLater={dismissOnboarding} />
      ) : null}

      <StorybookDioramaBackground
        height={248}
        style={{ borderWidth: 2, borderColor: "#C39461" }}
      >
        <View
          style={{
            flex: 1,
            padding: 12,
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              alignSelf: "flex-end",
              backgroundColor: "rgba(255,253,246,0.92)",
              borderRadius: 99,
              borderWidth: 1,
              borderColor: "#D8B77F",
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: C.forestDark, fontSize: 10, fontWeight: "900" }}>
              นิทานจากสถานที่จริง
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3 }}>
            <View
              style={{
                flex: 1,
                maxWidth: 230,
                padding: 12,
                gap: 4,
                borderRadius: 19,
                backgroundColor: "rgba(255,251,232,0.94)",
                borderWidth: 1.5,
                borderColor: "#D9B578",
              }}
            >
              <Text style={{ color: C.forestDark, fontSize: 10, fontWeight: "900" }}>
                อุทยานหินเขางู · ราชบุรี
              </Text>
              <Text
                style={{
                  color: C.ink,
                  fontSize: 20,
                  lineHeight: 25,
                  fontWeight: "900",
                }}
              >
                ภูเขาหินปูน{"\n"}มีเรื่องเล่า
              </Text>
              <Text style={{ color: C.muted, fontSize: 10 }}>
                เริ่มอ่าน แล้วออกเดินทางไปด้วยกัน
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/(tabs)/explore")}
                style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingTop: 3 }}
              >
                <Text style={{ color: C.forest, fontSize: 12, fontWeight: "900" }}>
                  เปิดหน้าถัดไป
                </Text>
                <Ionicons name="arrow-forward-circle" size={17} color={C.forest} />
              </Pressable>
            </View>
            <StorybookMascot
              size={91}
              style={{ marginBottom: -4 }}
              accessibilityLabel="งูน้อยนักสำรวจชวนเปิดนิทาน"
            />
          </View>
        </View>
      </StorybookDioramaBackground>

      <Card style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 13,
                backgroundColor: C.orangeSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="sparkles" size={19} color="#B97E22" />
            </View>
            <View>
              <Text style={{ color: C.ink, fontWeight: "800", fontSize: 14 }}>
                พลังนักสำรวจ
              </Text>
              <Text style={{ color: C.muted, fontSize: 11 }}>
                ทำภารกิจเพื่อสะสมดาวความรู้
              </Text>
            </View>
          </View>
          <Text style={{ color: C.forest, fontSize: 16, fontWeight: "900" }}>
            {data.xp} XP
          </Text>
        </View>
        <View
          style={{
            height: 8,
            borderRadius: 8,
            backgroundColor: "#EDF0E6",
            marginTop: 14,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: 8,
              borderRadius: 8,
              backgroundColor: C.leaf,
            }}
          />
        </View>
        <Text style={{ color: C.muted, fontSize: 11, marginTop: 7 }}>
          {learnedCount}/3 บทเรียนที่อ่านแล้ว · {openCount} ภารกิจที่รออยู่
        </Text>
      </Card>

      <View style={{ gap: 11 }}>
        <SectionTitle title="เลือกการผจญภัย" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {[
            {
              title: "เรื่องราว",
              sub: "อดีตเขางู",
              icon: "book-outline" as const,
              tint: "#E9EFE0",
              path: "/history" as const,
            },
            {
              title: "แผนที่",
              sub: "เลือกจุดสนใจ",
              icon: "map-outline" as const,
              tint: "#DCEFEA",
              path: "/map" as const,
            },
            {
              title: "หมุนดู 3D",
              sub: "ลากเพื่อชมวิว",
              icon: "cube-outline" as const,
              tint: "#F5E8D9",
              path: "/scene-3d" as const,
            },
            {
              title: "ภารกิจ",
              sub: `${openCount} งานที่ต้องทำ`,
              icon: "checkbox-outline" as const,
              tint: "#F8EBCB",
              path: "/missions" as const,
            },
          ].map((item) => (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              onPress={() => router.push(item.path)}
              style={({ pressed }) => ({
                width: "48%",
                flexGrow: 1,
                minHeight: 102,
                padding: 14,
                borderRadius: 19,
                backgroundColor: C.paper,
                borderWidth: 1,
                borderColor: C.line,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                opacity: pressed ? 0.78 : 1,
              })}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  backgroundColor: item.tint,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={item.icon} size={20} color={C.forest} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.ink, fontSize: 13, fontWeight: "900" }}>
                  {item.title}
                </Text>
                <Text style={{ color: C.muted, fontSize: 10, marginTop: 4 }}>
                  {item.sub}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: 11 }}>
        <SectionTitle
          title="ภารกิจของฉัน"
          action="ดูทั้งหมด"
          onAction={() => router.push("/missions")}
        />
        {data.tasks.length === 0 ? (
          <Card style={{ alignItems: "center", gap: 8 }}>
            <Ionicons name="leaf-outline" size={27} color={C.leaf} />
            <Text style={{ color: C.ink, fontWeight: "800" }}>
              สมุดยังว่างอยู่เลย
            </Text>
            <Text style={{ color: C.muted, fontSize: 12 }}>
              เพิ่มภารกิจเล็ก ๆ แล้วเริ่มสำรวจได้ทันที
            </Text>
            <ActionButton
              label="เพิ่มภารกิจ"
              icon="add"
              small
              onPress={() => router.push("/missions")}
            />
          </Card>
        ) : (
          data.tasks.slice(0, 2).map((task) => (
            <Pressable
              key={task.id}
              accessibilityRole="button"
              onPress={() => toggleTask(task.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 11,
                backgroundColor: C.paper,
                borderRadius: 17,
                borderWidth: 1,
                borderColor: C.line,
                padding: 13,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor: task.status === "done" ? C.forest : "#CAD4C6",
                  backgroundColor:
                    task.status === "done" ? C.forest : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {task.status === "done" ? (
                  <Ionicons name="checkmark" size={15} color={C.white} />
                ) : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: task.status === "done" ? C.muted : C.ink,
                    fontSize: 13,
                    fontWeight: "700",
                    textDecorationLine:
                      task.status === "done" ? "line-through" : "none",
                  }}
                >
                  {task.title}
                </Text>
                <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>
                  {task.category}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9DA79A" />
            </Pressable>
          ))
        )}
      </View>
      <View style={{ alignItems: "center", paddingTop: 4, paddingBottom: 8 }}>
        <Text style={{ color: C.muted, fontSize: 10 }}>
          รูปถ่ายสถานที่จริงพร้อมที่มา · แผนที่และฉาก 3D เป็นแบบจำลองการเรียนรู้
        </Text>
      </View>
    </Screen>
  );
}
