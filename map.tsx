import React, { useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import Svg, {
  Circle,
  Ellipse,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
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
import { mapPoints } from "@/lib/content";

export default function MapScreen() {
  const router = useRouter();
  const { isOffline } = useAppStore();
  const [selectedId, setSelectedId] = useState(mapPoints[0].id);
  const [canvasWidth, setCanvasWidth] = useState(330);
  const mapScale = Math.min(canvasWidth / 360, 295 / 270);
  const mapOffsetX = (canvasWidth - 360 * mapScale) / 2;
  const mapOffsetY = (295 - 270 * mapScale) / 2;
  const selected =
    mapPoints.find((point) => point.id === selectedId) ?? mapPoints[0];
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/(tabs)/explore");
  return (
    <Screen>
      <BackHeader title="แผนที่อุทยาน" onBack={back} />
      {isOffline ? (
        <OfflineBanner message="ออฟไลน์อยู่ — แผนผังจำลองยังใช้ได้" />
      ) : null}
      <View style={{ gap: 4 }}>
        <Text style={{ color: C.ink, fontSize: 23, fontWeight: "900" }}>
          เลือกจุดที่สนใจ
        </Text>
        <Text style={{ color: C.muted, fontSize: 12, lineHeight: 19 }}>
          แตะหมุดเพื่ออ่านคำอธิบาย · แผนผังจำลอง ไม่ใช่เส้นทางจริง
        </Text>
      </View>
      <Card style={{ padding: 10, overflow: "hidden" }}>
        <View
          onLayout={(event) => setCanvasWidth(event.nativeEvent.layout.width)}
          style={{ height: 295 }}
        >
          <Svg
            width="100%"
            height={295}
            viewBox="0 0 360 270"
            accessibilityLabel="แผนผังจำลองอุทยานหินเขางู"
          >
            <Rect x="0" y="0" width="360" height="270" rx="18" fill="#DDF4F5" />
            <Circle cx="313" cy="34" r="17" fill="#FFD266" stroke="#E7A84E" strokeWidth="1.5" />
            <Ellipse cx="177" cy="161" rx="115" ry="72" fill="#80D8D4" stroke="#4E9C90" strokeWidth="2" />
            <Path
              d="M0 64 C54 59 74 9 121 38 C150 57 167 31 197 20 C232 8 248 46 278 42 C313 36 330 60 360 48 L360 0 L0 0Z"
              fill="#A8D58B"
              stroke="#648F61"
              strokeWidth="1.6"
            />
            <Path
              d="M19 71 L48 28 L71 70Z M77 63 L113 16 L144 66Z M240 73 L273 22 L302 74Z M292 70 L323 30 L351 77Z"
              fill="#8AB678"
              stroke="#66895A"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <Path
              d="M30 176 C78 188 82 118 128 121 C175 124 184 202 231 189 C269 179 279 113 328 130"
              fill="none"
              stroke="#FFF0C9"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <Path
              d="M30 176 C78 188 82 118 128 121 C175 124 184 202 231 189 C269 179 279 113 328 130"
              fill="none"
              stroke="#C38D50"
              strokeWidth="2.5"
              strokeDasharray="7 7"
              strokeLinecap="round"
            />
            <Path
              d="M45 92 C85 82 116 93 139 106 M228 98 C248 91 270 93 294 105"
              fill="none"
              stroke="#5C9863"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <SvgText
              x="12"
              y="249"
              fill="#4A7750"
              fontSize="10"
              fontWeight="700"
            >
              ผืนน้ำและภูเขาหินปูน · ภาพจำลอง
            </SvgText>
            {mapPoints.map((point, index) => {
              const cx = 18 + point.x * 324;
              const cy = 18 + point.y * 225;
              const active = point.id === selectedId;
              return (
                <React.Fragment key={point.id}>
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={active ? 16 : 13}
                    fill={active ? "#49854F" : "#FFFDF6"}
                    stroke="#FFF8E8"
                    strokeWidth="3.5"
                  />
                  <SvgText
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fill={active ? "#FFFFFF" : "#4A7750"}
                    fontSize="11"
                    fontWeight="700"
                  >
                    {String(index + 1)}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
          {mapPoints.map((point) => (
            <Pressable
              key={point.id}
              accessibilityRole="button"
              accessibilityLabel={`เลือก ${point.title}`}
              accessibilityState={{ selected: selectedId === point.id }}
              onPress={() => setSelectedId(point.id)}
              style={{
                position: "absolute",
                left: mapOffsetX + (18 + point.x * 324) * mapScale - 22,
                top: mapOffsetY + (18 + point.y * 225) * mapScale - 22,
                width: 44,
                height: 44,
                borderRadius: 22,
              }}
            />
          ))}
        </View>
      </Card>
      <View style={{ flexDirection: "row", gap: 7, flexWrap: "wrap" }}>
        {mapPoints.map((point, index) => (
          <Pressable
            key={point.id}
            accessibilityRole="button"
            accessibilityState={{ selected: point.id === selectedId }}
            onPress={() => setSelectedId(point.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 14,
              backgroundColor: point.id === selectedId ? C.forest : C.paper,
              borderWidth: 1,
              borderColor: point.id === selectedId ? C.forest : C.line,
            }}
          >
            <Text
              style={{
                color: point.id === selectedId ? C.white : C.forest,
                fontWeight: "900",
                fontSize: 11,
              }}
            >
              {index + 1}
            </Text>
            <Text
              style={{
                color: point.id === selectedId ? C.white : C.ink,
                fontWeight: "700",
                fontSize: 11,
              }}
            >
              {point.title}
            </Text>
          </Pressable>
        ))}
      </View>
      <Card style={{ gap: 9 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 37,
              height: 37,
              borderRadius: 13,
              backgroundColor: C.leafSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="location" size={19} color={C.forest} />
          </View>
          <View>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: "800" }}>
              จุด {mapPoints.findIndex((item) => item.id === selected.id) + 1}
            </Text>
            <Text style={{ color: C.ink, fontSize: 16, fontWeight: "900" }}>
              {selected.title}
            </Text>
          </View>
        </View>
        <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20 }}>
          {selected.note}
        </Text>
      </Card>
      <ActionButton
        label="เปิดตำแหน่งในแผนที่ภายนอก"
        icon="navigate-outline"
        tone="soft"
        onPress={() =>
          Linking.openURL(
            "https://maps.google.com/?q=Khao+Ngu+Stone+Park+Ratchaburi",
          )
        }
      />
      <Text
        style={{
          color: C.muted,
          fontSize: 10,
          lineHeight: 16,
          textAlign: "center",
        }}
      >
        หมุดและตำแหน่งในภาพเป็นแผนผังการเรียนรู้
        ไม่ยืนยันระยะทางหรือพิกัดของจุดจริง
      </Text>
    </Screen>
  );
}
