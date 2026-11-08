import React, { useState } from "react";
import { Image, Linking, Pressable, View } from "react-native";
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
import { parkPhotos } from "@/lib/content";

export default function GalleryScreen() {
  const router = useRouter();
  const { isOffline } = useAppStore();
  const [failed, setFailed] = useState<string[]>([]);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/(tabs)/explore");
  return (
    <Screen>
      <BackHeader title="ภาพจริงเขางู" onBack={back} />
      {isOffline ? (
        <OfflineBanner message="ออฟไลน์อยู่ — ภาพที่บันทึกไว้ในแอปยังดูได้" />
      ) : null}
      <Text style={{ color: C.muted, fontSize: 13, lineHeight: 21 }}>
        ภาพถ่ายจริงช่วยให้เห็นภูมิทัศน์
        ก่อนออกเดินทางอย่าลืมตรวจข้อมูลสถานที่และสภาพอากาศล่าสุด
      </Text>
      {parkPhotos.map((photo) => (
        <Card key={photo.id} style={{ padding: 0, overflow: "hidden" }}>
          {failed.includes(photo.id) ? (
            <View
              style={{
                height: 190,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#E9EFE0",
                gap: 8,
              }}
            >
              <Ionicons name="image-outline" size={30} color={C.forest} />
              <Text style={{ color: C.muted, fontSize: 12 }}>
                เปิดภาพนี้ไม่ได้
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setFailed((current) =>
                    current.filter((id) => id !== photo.id),
                  )
                }
              >
                <Text
                  style={{ color: C.forest, fontSize: 12, fontWeight: "800" }}
                >
                  ลองใหม่
                </Text>
              </Pressable>
            </View>
          ) : (
            <Image
              source={photo.image}
              onError={() => setFailed((current) => [...current, photo.id])}
              resizeMode="cover"
              style={{ width: "100%", height: 190, backgroundColor: "#E9EFE0" }}
              accessibilityLabel={photo.title}
            />
          )}
          <View style={{ padding: 15, gap: 7 }}>
            <Text style={{ color: C.ink, fontSize: 16, fontWeight: "900" }}>
              {photo.title}
            </Text>
            <Text style={{ color: C.muted, fontSize: 12, lineHeight: 19 }}>
              {photo.caption}
            </Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => Linking.openURL(photo.sourceUrl)}
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Ionicons name="link-outline" size={14} color={C.forest} />
              <Text
                style={{ color: C.forest, fontSize: 10, fontWeight: "800" }}
              >
                ภาพ: {photo.credit} · ดูต้นทาง
              </Text>
            </Pressable>
          </View>
        </Card>
      ))}
      <Card style={{ gap: 7, backgroundColor: "#F1F1E5" }}>
        <Text style={{ color: C.forest, fontSize: 12, fontWeight: "900" }}>
          หมายเหตุการใช้ภาพ
        </Text>
        <Text style={{ color: C.muted, fontSize: 11, lineHeight: 18 }}>
          รูปถ่ายแต่ละภาพระบุแหล่งที่มาเพื่อการเรียนรู้ หากนำไปใช้ต่อ
          โปรดตรวจสอบสิทธิ์กับเจ้าของภาพก่อน
        </Text>
      </Card>
      <ActionButton
        label="เปิดแผนผังจำลอง"
        icon="map-outline"
        onPress={() => router.push("/map")}
      />
    </Screen>
  );
}
