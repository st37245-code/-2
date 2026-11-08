import React, { useState } from "react";
import { Linking, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StorybookMascot } from "@/components/storybook-art";

import {
  ActionButton,
  C,
  Card,
  ConfirmDialog,
  FieldInput,
  OfflineBanner,
  PageHeader,
  Screen,
  ToggleRow,
} from "@/components/primitives";
import { ScaledText as Text } from "@/components/scaled-text";
import { useAppStore } from "@/hooks/app-store";
import {
  cancelTaskReminders,
  requestNotificationPermission,
  scheduleTaskReminder,
} from "@/lib/reminders";
import type { ReminderResult } from "@/lib/reminders";

export default function ProfileScreen() {
  const router = useRouter();
  const {
    data,
    isOffline,
    updateSettings,
    setReminderStatus,
    replayOnboarding,
    recoverStorage,
  } = useAppStore();
  const [permissionMessage, setPermissionMessage] = useState("");
  const [permissionState, setPermissionState] = useState<ReminderResult | null>(
    null,
  );
  const [confirmReset, setConfirmReset] = useState(false);

  const enableReminders = async (enabled: boolean) => {
    if (!enabled) {
      const cancelled = await cancelTaskReminders();
      updateSettings({ notificationsEnabled: false });
      data.tasks
        .filter((task) => task.reminderStatus === "scheduled")
        .forEach((task) => setReminderStatus(task.id, "needs-permission"));
      setPermissionMessage(
        cancelled
          ? "ปิดการเตือนแล้ว และยกเลิกการแจ้งเตือนที่รออยู่"
          : "ปิดการเตือนแล้ว แต่ยกเลิกการแจ้งเตือนค้างไม่สำเร็จ",
      );
      setPermissionState(cancelled ? "scheduled" : "failed");
      return;
    }
    const result = await requestNotificationPermission();
    setPermissionState(result);
    if (result === "scheduled") {
      updateSettings({ notificationsEnabled: true });
      const pending = data.tasks.filter(
        (task) =>
          task.reminder !== "none" && task.reminderStatus !== "scheduled",
      );
      let scheduledCount = 0;
      let deniedCount = 0;
      for (const task of pending) {
        const scheduleResult = await scheduleTaskReminder(
          task.title,
          task.reminder,
        );
        setReminderStatus(
          task.id,
          scheduleResult === "scheduled" ? "scheduled" : scheduleResult,
        );
        if (scheduleResult === "scheduled") scheduledCount += 1;
        if (scheduleResult === "denied") deniedCount += 1;
      }
      if (deniedCount > 0) {
        updateSettings({ notificationsEnabled: false });
        setPermissionState("denied");
        setPermissionMessage(
          "สิทธิ์แจ้งเตือนถูกปิดระหว่างตั้งเตือน เปิดใหม่ได้ในการตั้งค่าอุปกรณ์",
        );
      } else {
        setPermissionMessage(
          scheduledCount > 0
            ? `เปิดสิทธิ์แล้ว ตั้งเตือนที่ค้างอยู่ ${scheduledCount} รายการ`
            : "เปิดสิทธิ์แจ้งเตือนแล้ว ตั้งเตือนได้ตอนสร้างภารกิจ",
        );
      }
    } else if (result === "denied") {
      updateSettings({ notificationsEnabled: false });
      setPermissionMessage(
        "ยังไม่ได้รับสิทธิ์แจ้งเตือน เปิดได้ในการตั้งค่าอุปกรณ์",
      );
    } else if (result === "unsupported") {
      updateSettings({ notificationsEnabled: false });
      setPermissionMessage(
        "Web Preview ไม่รองรับการแจ้งเตือนในระบบ ใช้แอปบนมือถือแทน",
      );
    } else {
      updateSettings({ notificationsEnabled: false });
      setPermissionMessage("เปิดการแจ้งเตือนไม่สำเร็จ ลองอีกครั้งภายหลัง");
    }
  };

  return (
    <Screen>
      {isOffline ? <OfflineBanner /> : null}
      <PageHeader
        title="สมุดของฉัน"
        subtitle="ตั้งค่าและดูความคืบหน้า"
        icon="person-circle-outline"
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
            width: 55,
            height: 55,
            borderRadius: 19,
            backgroundColor: C.paper,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StorybookMascot size={53} accessibilityLabel="งูน้อยในสมุดนักสำรวจ" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.forest, fontSize: 10, fontWeight: "800" }}>
            นักสำรวจตัวน้อย
          </Text>
          <Text style={{ color: C.ink, fontSize: 17, fontWeight: "900" }}>
            {data.settings.displayName}
          </Text>
          <Text style={{ color: C.muted, fontSize: 10 }}>
            ข้อมูลทั้งหมดเก็บไว้ในอุปกรณ์
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: C.forest, fontSize: 17, fontWeight: "900" }}>
            {data.xp}
          </Text>
          <Text style={{ color: C.muted, fontSize: 9 }}>XP</Text>
        </View>
      </Card>
      <Card style={{ gap: 13 }}>
        <Text style={{ color: C.ink, fontSize: 15, fontWeight: "900" }}>
          ปรับแต่งสมุดสำรวจ
        </Text>
        <FieldInput
          label="ชื่อที่แสดง"
          value={data.settings.displayName}
          maxLength={24}
          onChangeText={(displayName) => updateSettings({ displayName })}
          placeholder="นักสำรวจ"
        />
        <ToggleRow
          label="ตัวอักษรขนาดใหญ่"
          description="ขยายข้อความในทุกหน้าของแอป"
          value={data.settings.largeText}
          onValueChange={(largeText) => updateSettings({ largeText })}
        />
        <ToggleRow
          label="ลดการเคลื่อนไหว"
          description="ใช้การเปลี่ยนหน้าจอแบบเรียบง่าย"
          value={data.settings.reduceMotion}
          onValueChange={(reduceMotion) => updateSettings({ reduceMotion })}
        />
        <ToggleRow
          label="จำลองโหมดออฟไลน์"
          description="ทดสอบการใช้ข้อมูลที่เก็บในเครื่อง"
          value={data.settings.offlineDemo}
          onValueChange={(offlineDemo) => updateSettings({ offlineDemo })}
        />
        <ToggleRow
          label="อนุญาตการแจ้งเตือน"
          description="ควบคุมการตั้งเตือนรายภารกิจบนมือถือ"
          value={data.settings.notificationsEnabled}
          onValueChange={(enabled) => void enableReminders(enabled)}
        />
        {permissionMessage ? (
          <View
            style={{
              padding: 10,
              borderRadius: 12,
              backgroundColor:
                permissionState === "denied" || permissionState === "failed"
                  ? "#FFF0EA"
                  : C.leafSoft,
              flexDirection: "row",
              gap: 7,
            }}
          >
            <Ionicons
              name={
                permissionState === "scheduled"
                  ? "checkmark-circle"
                  : "information-circle-outline"
              }
              size={15}
              color={C.forest}
            />
            <Text
              style={{
                color: C.forestDark,
                fontSize: 11,
                lineHeight: 17,
                flex: 1,
              }}
            >
              {permissionMessage}
            </Text>
          </View>
        ) : null}
      </Card>
      <Card style={{ gap: 11 }}>
        <Text style={{ color: C.ink, fontSize: 15, fontWeight: "900" }}>
          ความคืบหน้าของฉัน
        </Text>
        <View style={{ flexDirection: "row", gap: 9 }}>
          {[
            {
              label: "ภารกิจสำเร็จ",
              value: data.tasks.filter((task) => task.status === "done").length,
              icon: "checkmark-circle" as const,
            },
            {
              label: "บทเรียน",
              value: data.learnedLessonIds.length,
              icon: "book" as const,
            },
            {
              label: "งูที่พบ",
              value: data.unlockedSnakeIds.length,
              icon: "leaf" as const,
            },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                borderRadius: 14,
                backgroundColor: "#F4F5EC",
                padding: 10,
                alignItems: "center",
                gap: 5,
              }}
            >
              <Ionicons name={stat.icon} size={17} color={C.forest} />
              <Text style={{ color: C.ink, fontSize: 17, fontWeight: "900" }}>
                {stat.value}
              </Text>
              <Text
                style={{ color: C.muted, fontSize: 9, textAlign: "center" }}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </Card>
      <View style={{ gap: 9 }}>
        <ActionButton
          label="ดูคำแนะนำการใช้งาน"
          icon="help-circle-outline"
          tone="soft"
          onPress={() => {
            replayOnboarding();
            router.replace("/(tabs)");
          }}
        />
        <ActionButton
          label="อ่านแหล่งข้อมูลและเครดิตภาพ"
          icon="information-circle-outline"
          tone="outline"
          onPress={() => router.push("/(tabs)/explore")}
        />
        <ActionButton
          label="รีเซ็ตความคืบหน้าในเครื่อง"
          icon="refresh-outline"
          tone="outline"
          onPress={() => setConfirmReset(true)}
        />
      </View>
      <Card style={{ gap: 6, backgroundColor: "#F1F1E5" }}>
        <Text style={{ color: C.forest, fontSize: 12, fontWeight: "900" }}>
          ความเป็นส่วนตัวและข้อมูล
        </Text>
        <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16 }}>
          ไม่ต้องสมัครสมาชิก ชื่อที่แสดง ภารกิจ คะแนน
          และบทเรียนที่อ่านจะอยู่ในอุปกรณ์เครื่องนี้
          การรีเซ็ตจะลบข้อมูลที่แอปบันทึกไว้
        </Text>
        <Text
          onPress={() =>
            Linking.openURL(
              "https://www.ratchaburipao.go.th/travel-single.php?slug=%E0%B8%AD%E0%B8%B8%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%99%E0%B8%AB%E0%B8%B4%E0%B8%99%E0%B9%80%E0%B8%82%E0%B8%B2%E0%B8%87%E0%B8%B9",
            )
          }
          accessibilityRole="link"
          style={{
            color: C.forest,
            fontSize: 10,
            fontWeight: "700",
            paddingTop: 4,
          }}
        >
          องค์การบริหารส่วนจังหวัดราชบุรี ↗
        </Text>
        <Text
          onPress={() =>
            Linking.openURL(
              "https://th.wikipedia.org/wiki/%E0%B9%80%E0%B8%82%E0%B8%B2%E0%B8%87%E0%B8%B9",
            )
          }
          accessibilityRole="link"
          style={{ color: C.forest, fontSize: 10, fontWeight: "700" }}
        >
          ข้อมูลประวัติและถ้ำ ↗
        </Text>
      </Card>
      <ConfirmDialog
        visible={confirmReset}
        title="รีเซ็ตสมุดสำรวจ?"
        message="ภารกิจ คะแนน งูที่ปลดล็อก และชื่อที่แสดงจะถูกลบจากอุปกรณ์นี้ เริ่มใหม่ได้แต่ย้อนกลับไม่ได้"
        confirmLabel="รีเซ็ตข้อมูล"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          void recoverStorage(true);
        }}
      />
    </Screen>
  );
}
