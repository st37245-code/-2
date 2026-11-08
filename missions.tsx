import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  ActionButton,
  BackHeader,
  C,
  Card,
  FieldInput,
  OfflineBanner,
  Pill,
  Screen,
  SearchField,
} from "@/components/primitives";
import { ScaledText as Text } from "@/components/scaled-text";
import { useAppStore } from "@/hooks/app-store";
import { scheduleTaskReminder } from "@/lib/reminders";
import { taskCategories } from "@/lib/models";
import type {
  LearningTask,
  ReminderChoice,
  ReminderStatus,
  TaskCategory,
} from "@/lib/models";

const filters = ["ทั้งหมด", "กำลังทำ", "สำเร็จ"] as const;
type Filter = (typeof filters)[number];

export default function MissionsScreen() {
  const router = useRouter();
  const {
    data,
    isOffline,
    lastDeleted,
    addTask,
    setReminderStatus,
    updateSettings,
    toggleTask,
    deleteTask,
    undoDelete,
    clearUndo,
  } = useAppStore();
  const [filter, setFilter] = useState<Filter>("ทั้งหมด");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState<TaskCategory>("เรียนรู้");
  const [reminder, setReminder] = useState<ReminderChoice>("none");
  const [formNotice, setFormNotice] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState<LearningTask | null>(null);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/(tabs)");

  useEffect(() => {
    if (!lastDeleted) return;
    const timeout = setTimeout(clearUndo, 6000);
    return () => clearTimeout(timeout);
  }, [lastDeleted, clearUndo]);

  const filtered = useMemo(
    () =>
      data.tasks.filter((task) => {
        const matchesFilter =
          filter === "ทั้งหมด" ||
          (filter === "กำลังทำ" && task.status === "open") ||
          (filter === "สำเร็จ" && task.status === "done");
        return (
          matchesFilter &&
          task.title
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase())
        );
      }),
    [data.tasks, filter, query],
  );

  const openForm = () => {
    setNotice("");
    setFormNotice("");
    setFormOpen(true);
  };
  const chooseReminder = (value: ReminderChoice) => {
    if (value !== "none" && !data.settings.notificationsEnabled) {
      setFormNotice(
        "เปิดการแจ้งเตือนจากหน้า “สมุดของฉัน” ก่อน แล้วกลับมาเลือกเวลาเตือน",
      );
      return;
    }
    setReminder(value);
    setFormNotice("");
  };

  const create = async () => {
    const title = draft.trim();
    if (!title) {
      setFormNotice("ใส่ชื่อภารกิจสักนิดก่อนบันทึกนะ");
      return;
    }
    if (title.length > 80) {
      setFormNotice("ชื่อภารกิจยาวได้ไม่เกิน 80 ตัวอักษร");
      return;
    }
    const task = addTask(title, category, reminder);
    setDraft("");
    setReminder("none");
    setFormNotice("");
    setFormOpen(false);
    setNotice("เพิ่มภารกิจแล้ว บันทึกไว้ในเครื่องเรียบร้อย");
    if (reminder !== "none" && data.settings.notificationsEnabled) {
      const result = await scheduleTaskReminder(task.title, reminder);
      const status: ReminderStatus =
        result === "scheduled" ? "scheduled" : result;
      setReminderStatus(task.id, status);
      if (result === "denied") updateSettings({ notificationsEnabled: false });
      setNotice(
        result === "scheduled"
          ? "เพิ่มภารกิจและตั้งเตือนในเครื่องแล้ว"
          : result === "denied"
            ? "ภารกิจบันทึกแล้ว แต่สิทธิ์เตือนถูกปิด · เปิดใหม่ได้ในการตั้งค่าเครื่อง"
            : result === "unsupported"
              ? "ภารกิจบันทึกแล้ว · อุปกรณ์นี้ไม่รองรับการแจ้งเตือน"
              : "ภารกิจบันทึกแล้ว แต่ตั้งการเตือนไม่สำเร็จ ลองเปิดสิทธิ์อีกครั้ง",
      );
    } else if (reminder !== "none") {
      setReminderStatus(task.id, "needs-permission");
      setNotice(
        "บันทึกภารกิจแล้ว แต่ยังไม่ได้ตั้งเตือน · เปิดการแจ้งเตือนในหน้า “สมุดของฉัน” ก่อน",
      );
    }
  };

  const reminderLabel = (task: LearningTask) => {
    if (task.reminder === "none") return "";
    if (task.reminderStatus === "scheduled") return " · ตั้งเตือนแล้ว";
    if (task.reminderStatus === "needs-permission")
      return " · เปิดสิทธิ์เพื่อเตือน";
    if (task.reminderStatus === "denied") return " · ไม่มีสิทธิ์แจ้งเตือน";
    if (task.reminderStatus === "unsupported") return " · อุปกรณ์ไม่รองรับ";
    if (task.reminderStatus === "failed") return " · ตั้งเตือนไม่สำเร็จ";
    return " · กำลังตั้งเตือน";
  };

  return (
    <Screen>
      <BackHeader title="ภารกิจของฉัน" onBack={back} />
      {isOffline ? <OfflineBanner /> : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.ink, fontSize: 23, fontWeight: "900" }}>
            ค่อย ๆ ทำทีละอย่าง
          </Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
            งานถูกเก็บไว้ในอุปกรณ์ของคุณ
          </Text>
        </View>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 17,
            backgroundColor: C.orangeSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="checkbox" size={24} color="#B47C2A" />
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: C.paper,
            borderRadius: 16,
            padding: 12,
            borderWidth: 1,
            borderColor: C.line,
          }}
        >
          <Text style={{ color: C.muted, fontSize: 10 }}>กำลังทำ</Text>
          <Text
            style={{
              color: C.forest,
              fontSize: 19,
              fontWeight: "900",
              marginTop: 2,
            }}
          >
            {data.tasks.filter((task) => task.status === "open").length}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: C.paper,
            borderRadius: 16,
            padding: 12,
            borderWidth: 1,
            borderColor: C.line,
          }}
        >
          <Text style={{ color: C.muted, fontSize: 10 }}>ทำสำเร็จ</Text>
          <Text
            style={{
              color: C.forest,
              fontSize: 19,
              fontWeight: "900",
              marginTop: 2,
            }}
          >
            {data.tasks.filter((task) => task.status === "done").length}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: C.paper,
            borderRadius: 16,
            padding: 12,
            borderWidth: 1,
            borderColor: C.line,
          }}
        >
          <Text style={{ color: C.muted, fontSize: 10 }}>ดาวความรู้</Text>
          <Text
            style={{
              color: C.forest,
              fontSize: 19,
              fontWeight: "900",
              marginTop: 2,
            }}
          >
            {data.xp}
          </Text>
        </View>
      </View>
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="ค้นหาภารกิจ"
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {filters.map((item) => (
          <Pill
            key={item}
            label={item}
            selected={filter === item}
            onPress={() => setFilter(item)}
          />
        ))}
      </View>
      {notice ? (
        <View
          style={{
            padding: 11,
            borderRadius: 13,
            backgroundColor: C.leafSoft,
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={C.forest}
          />
          <Text
            style={{
              color: C.forest,
              fontSize: 11,
              fontWeight: "700",
              flex: 1,
            }}
          >
            {notice}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="ปิดข้อความ"
            onPress={() => setNotice("")}
          >
            <Ionicons name="close" size={16} color={C.forest} />
          </Pressable>
        </View>
      ) : null}
      {filtered.length === 0 ? (
        <Card style={{ alignItems: "center", gap: 9, paddingVertical: 25 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 19,
              backgroundColor: C.leafSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={query ? "search-outline" : "leaf-outline"}
              size={25}
              color={C.forest}
            />
          </View>
          <Text style={{ color: C.ink, fontWeight: "900", fontSize: 15 }}>
            {query
              ? "ไม่เจอภารกิจที่ค้นหา"
              : filter === "สำเร็จ"
                ? "ยังไม่มีงานที่ทำสำเร็จ"
                : "ยังไม่มีภารกิจในรายการนี้"}
          </Text>
          <Text style={{ color: C.muted, fontSize: 12, textAlign: "center" }}>
            {query
              ? "ลองใช้คำค้นอื่น หรือเคลียร์ช่องค้นหา"
              : "เริ่มจากงานเล็ก ๆ แล้วค่อยสำรวจต่อได้เลย"}
          </Text>
          {!query ? (
            <ActionButton
              label="เพิ่มภารกิจแรก"
              icon="add"
              small
              onPress={openForm}
            />
          ) : null}
        </Card>
      ) : (
        filtered.map((task) => (
          <Card key={task.id} style={{ padding: 13 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: task.status === "done" }}
                accessibilityLabel={
                  task.status === "done"
                    ? "ทำสำเร็จแล้ว ยกเลิกสถานะ"
                    : "ทำเครื่องหมายว่าสำเร็จ"
                }
                onPress={() => toggleTask(task.id)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9,
                  borderWidth: 1.5,
                  borderColor: task.status === "done" ? C.forest : "#C8D3C3",
                  backgroundColor:
                    task.status === "done" ? C.forest : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {task.status === "done" ? (
                  <Ionicons name="checkmark" size={17} color={C.white} />
                ) : null}
              </Pressable>
              <View style={{ flex: 1, gap: 3 }}>
                <Text
                  style={{
                    color: task.status === "done" ? C.muted : C.ink,
                    fontSize: 13,
                    fontWeight: "800",
                    textDecorationLine:
                      task.status === "done" ? "line-through" : "none",
                  }}
                >
                  {task.title}
                </Text>
                <Text style={{ color: C.muted, fontSize: 10 }}>
                  {task.category}
                  {reminderLabel(task)}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`ลบภารกิจ ${task.title}`}
                onPress={() => setDeleting(task)}
                style={{
                  width: 35,
                  height: 35,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 12,
                  backgroundColor: "#F9ECE7",
                }}
              >
                <Ionicons name="trash-outline" size={17} color={C.red} />
              </Pressable>
            </View>
          </Card>
        ))
      )}
      <ActionButton label="เพิ่มภารกิจใหม่" icon="add" onPress={openForm} />
      {lastDeleted ? (
        <View
          style={{
            borderRadius: 15,
            backgroundColor: C.forest,
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Text
            numberOfLines={1}
            style={{ color: C.white, fontSize: 11, flex: 1 }}
          >
            ลบ “{lastDeleted.title}” แล้ว
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={undoDelete}
            style={{ padding: 6 }}
          >
            <Text style={{ color: "#E3F4D6", fontWeight: "900", fontSize: 12 }}>
              ย้อนกลับ
            </Text>
          </Pressable>
        </View>
      ) : null}

      <Modal
        visible={formOpen}
        transparent
        animationType={data.settings.reduceMotion ? "none" : "slide"}
        onRequestClose={() => setFormOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(23,42,30,0.48)",
          }}
        >
          <View
            style={{
              backgroundColor: C.cream,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              maxHeight: "90%",
              paddingTop: 20,
              paddingHorizontal: 20,
              paddingBottom: 28,
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 17, paddingBottom: 5 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text
                    style={{ color: C.ink, fontSize: 20, fontWeight: "900" }}
                  >
                    สร้างภารกิจ
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>
                    เขียนสั้น ๆ ให้ทำตามได้จริง
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="ปิดแบบฟอร์ม"
                  onPress={() => setFormOpen(false)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 13,
                    backgroundColor: C.paper,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={20} color={C.forest} />
                </Pressable>
              </View>
              <FieldInput
                label="ชื่อภารกิจ"
                placeholder="เช่น อ่านเรื่องราวถ้ำเขางู"
                value={draft}
                onChangeText={(value) => setDraft(value.slice(0, 80))}
                maxLength={80}
                returnKeyType="done"
              />
              <View style={{ gap: 9 }}>
                <Text style={{ color: C.ink, fontSize: 13, fontWeight: "700" }}>
                  หมวด
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {taskCategories.map((item) => (
                    <Pill
                      key={item}
                      label={item}
                      selected={category === item}
                      onPress={() => setCategory(item)}
                    />
                  ))}
                </View>
              </View>
              <View style={{ gap: 9 }}>
                <Text style={{ color: C.ink, fontSize: 13, fontWeight: "700" }}>
                  เตือนฉัน
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  <Pill
                    label="ไม่เตือน"
                    selected={reminder === "none"}
                    onPress={() => chooseReminder("none")}
                  />
                  <Pill
                    label="อีก 1 ชั่วโมง"
                    icon="time-outline"
                    selected={reminder === "in-hour"}
                    onPress={() => chooseReminder("in-hour")}
                  />
                  <Pill
                    label="พรุ่งนี้"
                    icon="sunny-outline"
                    selected={reminder === "tomorrow"}
                    onPress={() => chooseReminder("tomorrow")}
                  />
                </View>
                <Text style={{ color: C.muted, fontSize: 10, lineHeight: 16 }}>
                  {data.settings.notificationsEnabled
                    ? "แจ้งเตือนเมื่อถึงเวลาบนมือถือ · Web Preview ไม่ส่งการแจ้งเตือนระบบ"
                    : "เปิดการแจ้งเตือนในหน้า “สมุดของฉัน” ก่อนเลือกเวลาเตือน"}
                </Text>
                {formNotice ? (
                  <Text
                    accessibilityRole="alert"
                    style={{ color: C.red, fontSize: 11, lineHeight: 17 }}
                  >
                    {formNotice}
                  </Text>
                ) : null}
              </View>
              <ActionButton
                label="บันทึกภารกิจ"
                icon="checkmark"
                onPress={() => void create()}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={!!deleting}
        transparent
        animationType={data.settings.reduceMotion ? "none" : "fade"}
        onRequestClose={() => setDeleting(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(22,38,29,0.48)",
            justifyContent: "center",
            alignItems: "center",
            padding: 22,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 390,
              backgroundColor: C.paper,
              padding: 22,
              borderRadius: 24,
              gap: 12,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: "#F9ECE7",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="trash-outline" size={22} color={C.red} />
            </View>
            <Text style={{ color: C.ink, fontWeight: "900", fontSize: 18 }}>
              ลบภารกิจนี้ไหม?
            </Text>
            <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20 }}>
              “{deleting?.title}” จะถูกนำออกจากรายการ
              คุณย้อนกลับได้ในอีกไม่กี่วินาที
            </Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <View style={{ flex: 1 }}>
                <ActionButton
                  label="เก็บไว้"
                  tone="outline"
                  onPress={() => setDeleting(null)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ActionButton
                  label="ลบภารกิจ"
                  tone="danger"
                  onPress={() => {
                    if (deleting) deleteTask(deleting.id);
                    setDeleting(null);
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
