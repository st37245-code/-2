import React, {
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { PanResponder, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
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

type Point3 = { x: number; y: number; z: number };
type ScenePose = { yaw: number; pitch: number; zoom: number };
type Face = { points: string; depth: number; fill: string };

const rockGroups = [
  { x: -1.75, z: -0.35, radius: 0.48, height: 1.75, phase: 0.1, shade: 0 },
  { x: -0.9, z: -0.68, radius: 0.62, height: 2.15, phase: 0.35, shade: 1 },
  { x: 0.05, z: -0.76, radius: 0.56, height: 2.42, phase: 0.05, shade: 2 },
  { x: 1.05, z: -0.55, radius: 0.58, height: 2.06, phase: 0.25, shade: 0 },
  { x: 1.76, z: -0.15, radius: 0.43, height: 1.55, phase: 0.5, shade: 1 },
  { x: -1.9, z: 0.28, radius: 0.34, height: 1.15, phase: 0.4, shade: 2 },
];

const rockPalettes = [
  ["#FFE9AA", "#F6D48E", "#EAC07E", "#D99B79", "#F4D7A5"],
  ["#FFF0B9", "#F3D897", "#E6BB8A", "#D9957E", "#F6D9AD"],
  ["#FFE8A4", "#F3CC7E", "#E8BC80", "#CE8E73", "#F7D99E"],
];

function project(point: Point3, pose: ScenePose) {
  const x1 = point.x * Math.cos(pose.yaw) - point.z * Math.sin(pose.yaw);
  const z1 = point.x * Math.sin(pose.yaw) + point.z * Math.cos(pose.yaw);
  const y1 = point.y * Math.cos(pose.pitch) - z1 * Math.sin(pose.pitch);
  const z2 = point.y * Math.sin(pose.pitch) + z1 * Math.cos(pose.pitch);
  const perspective = 5.4 / (5.4 + z2 * 0.17);
  return {
    x: 180 + x1 * 48 * perspective * pose.zoom,
    y: 195 - y1 * 45 * perspective * pose.zoom,
    depth: z2,
    size: perspective * pose.zoom,
  };
}

function pointsString(points: Point3[], pose: ScenePose) {
  return points
    .map((point) => {
      const screen = project(point, pose);
      return `${screen.x.toFixed(1)},${screen.y.toFixed(1)}`;
    })
    .join(" ");
}

function ringPoints(
  centerX: number,
  centerZ: number,
  radiusX: number,
  radiusZ: number,
  y: number,
  count: number,
  pose: ScenePose,
  variation = 0,
) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count;
    const ripple = 1 + variation * Math.sin(angle * 3 + 0.65);
    return {
      x: centerX + Math.cos(angle) * radiusX * ripple,
      y,
      z: centerZ + Math.sin(angle) * radiusZ * ripple,
    };
  });
}

function sceneFaces(pose: ScenePose): Face[] {
  const faces: Face[] = [];
  rockGroups.forEach((rock) => {
    const base = ringPoints(rock.x, rock.z, rock.radius, rock.radius * 0.82, 0.16, 9, pose, 0.1);
    const shoulder = ringPoints(
      rock.x + 0.025,
      rock.z - 0.015,
      rock.radius * 0.66,
      rock.radius * 0.54,
      0.16 + rock.height * 0.57,
      9,
      pose,
      0.08,
    );
    const peak = { x: rock.x + 0.06, y: 0.16 + rock.height, z: rock.z - 0.045 };
    const colors = rockPalettes[rock.shade];
    base.forEach((point, index) => {
      const next = (index + 1) % base.length;
      const lower = [point, base[next], shoulder[next], shoulder[index]];
      const upper = [shoulder[index], shoulder[next], peak];
      const lowerProjection = lower.map((item) => project(item, pose));
      const upperProjection = upper.map((item) => project(item, pose));
      faces.push({
        points: lowerProjection.map((item) => `${item.x.toFixed(1)},${item.y.toFixed(1)}`).join(" "),
        depth: lowerProjection.reduce((sum, item) => sum + item.depth, 0) / lowerProjection.length,
        fill: colors[(index + 1) % colors.length],
      });
      faces.push({
        points: upperProjection.map((item) => `${item.x.toFixed(1)},${item.y.toFixed(1)}`).join(" "),
        depth: upperProjection.reduce((sum, item) => sum + item.depth, 0) / upperProjection.length,
        fill: colors[(index + 2) % colors.length],
      });
    });
  });
  return faces.sort((left, right) => right.depth - left.depth);
}

function linePath(points: Point3[], pose: ScenePose) {
  return points
    .map((point, index) => {
      const screen = project(point, pose);
      return `${index === 0 ? "M" : "L"}${screen.x.toFixed(1)} ${screen.y.toFixed(1)}`;
    })
    .join(" ");
}

function bridgeDeck(pose: ScenePose) {
  return Array.from({ length: 17 }, (_, index) => {
    const t = index / 16;
    return {
      x: -1.72 + t * 3.44,
      y: 0.2 + Math.sin(t * Math.PI) * 0.16,
      z: 0.48 - Math.sin(t * Math.PI) * 0.06,
    };
  }).map((point) => project(point, pose));
}

function createDragResponder(
  poseRef: MutableRefObject<ScenePose>,
  dragStart: MutableRefObject<ScenePose>,
  setPose: Dispatch<SetStateAction<ScenePose>>,
) {
  return PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_event, gesture) =>
      Math.hypot(gesture.dx, gesture.dy) > 5,
    onPanResponderGrant: () => {
      dragStart.current = poseRef.current;
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderMove: (_event, gesture) => {
      const next = {
        ...dragStart.current,
        yaw: dragStart.current.yaw + gesture.dx * 0.012,
        pitch: Math.max(0.16, Math.min(1.12, dragStart.current.pitch - gesture.dy * 0.005)),
      };
      poseRef.current = next;
      setPose(next);
    },
  });
}

function SceneIllustration({ pose }: { pose: ScenePose }) {
  const faces = useMemo(() => sceneFaces(pose), [pose]);
  const islandBottom = ringPoints(0, 0, 2.45, 1.14, -0.12, 24, pose, 0.04);
  const islandTop = ringPoints(0, 0, 2.45, 1.14, 0.02, 24, pose, 0.04);
  const lakeRim = ringPoints(0.03, 0.24, 1.82, 0.72, 0.16, 24, pose, 0.045);
  const lakeSurface = ringPoints(0.03, 0.24, 1.72, 0.65, 0.19, 24, pose, 0.04);
  const deck = bridgeDeck(pose);
  const bridgeLine = deck.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const trees = [
    { x: -2.02, z: 0.58, r: 10 },
    { x: -1.45, z: 0.88, r: 9 },
    { x: -0.86, z: 0.82, r: 8 },
    { x: 0.98, z: 0.88, r: 10 },
    { x: 1.58, z: 0.72, r: 9 },
    { x: 2.06, z: 0.43, r: 8 },
  ].map((tree) => ({ ...tree, screen: project({ x: tree.x, y: 0.14, z: tree.z }, pose) }));
  const cave = project({ x: 0.42, y: 0.27, z: -0.28 }, pose);
  const bridgeSideA = deck.map((point, index) => {
    const t = index / (deck.length - 1);
    const rail = project({ x: -1.72 + t * 3.44, y: 0.43 + Math.sin(t * Math.PI) * 0.16, z: 0.78 - Math.sin(t * Math.PI) * 0.06 }, pose);
    return rail;
  });
  const bridgeSideB = deck.map((point, index) => {
    const t = index / (deck.length - 1);
    const rail = project({ x: -1.72 + t * 3.44, y: 0.43 + Math.sin(t * Math.PI) * 0.16, z: 0.18 - Math.sin(t * Math.PI) * 0.06 }, pose);
    return rail;
  });

  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 292" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="storybookSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#A9E5F0" />
          <Stop offset="1" stopColor="#EAF8F5" />
        </LinearGradient>
        <LinearGradient id="pondColor" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#75DFD7" />
          <Stop offset="1" stopColor="#45BFC6" />
        </LinearGradient>
      </Defs>
      <Rect width="360" height="292" fill="url(#storybookSky)" />
      <Circle cx="306" cy="47" r="22" fill="#FFD266" stroke="#F4A94F" strokeWidth="2" />
      <Circle cx="306" cy="47" r="30" fill="#FFE99C" opacity="0.32" />
      <Path d="M0 113 Q44 91 88 108 Q130 88 174 105 Q218 91 258 106 Q308 89 360 109 L360 168 L0 168Z" fill="#B7E3B4" />
      <Path d="M0 131 Q47 107 98 124 Q153 105 207 125 Q274 102 360 126 L360 180 L0 180Z" fill="#94CF87" />
      <Path d="M35 65 C48 50 71 52 79 66 C93 61 105 70 104 81 L37 81 C27 78 27 68 35 65Z" fill="#FFFDF6" stroke="#B18C6B" strokeWidth="1.5" />
      <Path d="M191 84 C201 70 219 72 226 84 C240 80 249 89 247 98 L193 98 C184 95 184 87 191 84Z" fill="#FFFDF6" stroke="#B18C6B" strokeWidth="1.4" />
      <Path d="M116 52 l4 -8 l4 8 l8 4 l-8 3 l-4 8 l-4 -8 l-8 -3Z" fill="#FFF4C3" stroke="#D7A75D" strokeWidth="1" />

      <Polygon points={pointsString(islandBottom, pose)} fill="#B47A53" stroke="#704B3C" strokeWidth="2.4" strokeLinejoin="round" />
      {islandTop.map((point, index) => {
        const next = (index + 1) % islandTop.length;
        return (
          <Polygon
            key={`island-side-${index}`}
            points={pointsString([islandBottom[index], islandBottom[next], islandTop[next], point], pose)}
            fill={index % 3 === 0 ? "#C28A5B" : "#A96F4D"}
            stroke="#76513E"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        );
      })}
      <Polygon points={pointsString(islandTop, pose)} fill="#83C96D" stroke="#4F8650" strokeWidth="2" strokeLinejoin="round" />
      <Path d={linePath(ringPoints(-0.1, 0.04, 2.24, 0.93, 0.035, 24, pose, 0.04), pose)} fill="none" stroke="#C8E892" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
      <Polygon points={pointsString(lakeRim, pose)} fill="#F6D98F" stroke="#98684A" strokeWidth="2" strokeLinejoin="round" />
      <Polygon points={pointsString(lakeSurface, pose)} fill="url(#pondColor)" stroke="#398E8D" strokeWidth="1.8" strokeLinejoin="round" />
      <Path d={linePath([{ x: -1.35, y: 0.23, z: 0.37 }, { x: -0.85, y: 0.24, z: 0.19 }, { x: -0.32, y: 0.24, z: 0.11 }], pose)} fill="none" stroke="#D7FFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
      <Path d={linePath([{ x: 0.6, y: 0.24, z: 0.11 }, { x: 1.03, y: 0.23, z: 0.22 }, { x: 1.5, y: 0.23, z: 0.39 }], pose)} fill="none" stroke="#D7FFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />

      {faces.map((face, index) => (
        <Polygon
          key={`rock-face-${index}`}
          points={face.points}
          fill={face.fill}
          stroke="#8C634D"
          strokeWidth="1.15"
          strokeLinejoin="round"
        />
      ))}
      <Path d={linePath([{ x: -1.16, y: 0.7, z: -0.65 }, { x: -1.04, y: 1.12, z: -0.61 }, { x: -0.98, y: 1.45, z: -0.58 }], pose)} fill="none" stroke="#FFF3CF" strokeWidth="2.1" strokeLinecap="round" opacity="0.8" />
      <Path d={linePath([{ x: 0.95, y: 0.67, z: -0.55 }, { x: 1.03, y: 1.09, z: -0.5 }, { x: 1.12, y: 1.47, z: -0.45 }], pose)} fill="none" stroke="#FFF0C8" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
      <Ellipse cx={cave.x} cy={cave.y} rx={13 * cave.size} ry={17 * cave.size} fill="#805440" stroke="#6D4737" strokeWidth="2" />
      <Path d={`M${cave.x - 8 * cave.size} ${cave.y + 8 * cave.size} Q${cave.x} ${cave.y - 9 * cave.size} ${cave.x + 8 * cave.size} ${cave.y + 8 * cave.size}`} fill="none" stroke="#EED9A9" strokeWidth="2.2" strokeLinecap="round" />
      <Circle cx={cave.x} cy={cave.y + 8 * cave.size} r={2.2 * cave.size} fill="#F7D279" />

      <Path d={bridgeLine} fill="none" stroke="#684835" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <Path d={bridgeLine} fill="none" stroke="#D99C55" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d={bridgeLine} fill="none" stroke="#FFE1A0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d={bridgeSideA.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ")} fill="none" stroke="#85583E" strokeWidth="2.3" strokeLinecap="round" />
      <Path d={bridgeSideB.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ")} fill="none" stroke="#85583E" strokeWidth="2.3" strokeLinecap="round" />
      {deck.map((point, index) => {
        if (index % 2 !== 0) return null;
        const t = index / (deck.length - 1);
        const railA = project({ x: -1.72 + t * 3.44, y: 0.43 + Math.sin(t * Math.PI) * 0.16, z: 0.78 - Math.sin(t * Math.PI) * 0.06 }, pose);
        const railB = project({ x: -1.72 + t * 3.44, y: 0.43 + Math.sin(t * Math.PI) * 0.16, z: 0.18 - Math.sin(t * Math.PI) * 0.06 }, pose);
        const nearDeck = project({ x: -1.72 + t * 3.44, y: 0.2 + Math.sin(t * Math.PI) * 0.16, z: 0.78 - Math.sin(t * Math.PI) * 0.06 }, pose);
        const farDeck = project({ x: -1.72 + t * 3.44, y: 0.2 + Math.sin(t * Math.PI) * 0.16, z: 0.18 - Math.sin(t * Math.PI) * 0.06 }, pose);
        return (
          <React.Fragment key={`bridge-plank-${index}`}>
            <Line x1={nearDeck.x} y1={nearDeck.y} x2={farDeck.x} y2={farDeck.y} stroke="#A86D43" strokeWidth="1.3" />
            <Line x1={nearDeck.x} y1={nearDeck.y - 1} x2={railA.x} y2={railA.y} stroke="#9A6544" strokeWidth="1.2" />
            <Line x1={farDeck.x} y1={farDeck.y - 1} x2={railB.x} y2={railB.y} stroke="#9A6544" strokeWidth="1.2" />
          </React.Fragment>
        );
      })}

      {trees.map((tree, index) => (
        <React.Fragment key={`tree-${index}`}>
          <Line x1={tree.screen.x} y1={tree.screen.y + tree.r * 0.7} x2={tree.screen.x - 1} y2={tree.screen.y + tree.r * 1.8} stroke="#81513B" strokeWidth={Math.max(2, tree.screen.size * 3)} strokeLinecap="round" />
          <Circle cx={tree.screen.x} cy={tree.screen.y} r={tree.r * tree.screen.size} fill={index % 2 ? "#72B95E" : "#93D46B"} stroke="#4C8150" strokeWidth="1.6" />
          <Circle cx={tree.screen.x - tree.r * 0.42} cy={tree.screen.y + tree.r * 0.1} r={tree.r * 0.52 * tree.screen.size} fill="#B5E283" stroke="#5D9955" strokeWidth="1.1" />
          <Circle cx={tree.screen.x + tree.r * 0.36} cy={tree.screen.y + tree.r * 0.16} r={tree.r * 0.47 * tree.screen.size} fill="#65AA5D" stroke="#4C8150" strokeWidth="1.1" />
        </React.Fragment>
      ))}
      <Circle cx="57" cy="239" r="3" fill="#FFDF70" />
      <Circle cx="302" cy="234" r="3" fill="#FFDF70" />
      <SvgText x="180" y="277" textAnchor="middle" fill="#5E5145" fontSize="10" fontWeight="700">
        ภูเขาหินปูน · บึง · สะพานไม้
      </SvgText>
    </Svg>
  );
}

function SceneControl({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        minWidth: 48,
        height: 44,
        paddingHorizontal: 12,
        borderRadius: 17,
        backgroundColor: "#FFFDF6",
        borderWidth: 1.5,
        borderColor: "#E6C895",
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Ionicons name={icon} size={20} color={C.forestDark} />
    </Pressable>
  );
}

export default function Scene3DScreen() {
  const router = useRouter();
  const { isOffline, data } = useAppStore();
  const [pose, setPose] = useState<ScenePose>({ yaw: 0.65, pitch: 0.62, zoom: 1 });
  const poseRef = useRef(pose);
  const dragStart = useRef(pose);
  // PanResponder reads these refs only when a native drag callback fires, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() => createDragResponder(poseRef, dragStart, setPose));

  const updatePose = (next: ScenePose) => {
    poseRef.current = next;
    setPose(next);
  };
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/(tabs)/explore");
  const rotate = (direction: number, vertical = false) => {
    const next = { ...poseRef.current };
    if (vertical) next.pitch = Math.max(0.16, Math.min(1.12, next.pitch + direction * 0.12));
    else next.yaw += direction * 0.24;
    updatePose(next);
  };
  const zoom = (amount: number) =>
    updatePose({ ...poseRef.current, zoom: Math.max(0.82, Math.min(1.22, poseRef.current.zoom + amount)) });
  const angle = Math.round((((pose.yaw * 180) / Math.PI) % 360 + 360) % 360);

  return (
    <Screen>
      {isOffline ? <OfflineBanner message="ออฟไลน์อยู่ — โลกจิ๋วเขางูหมุนดูได้ในเครื่อง" /> : null}
      <BackHeader title="โลกจิ๋วเขางู" onBack={back} />
      <View style={{ gap: 5 }}>
        <Text style={{ color: C.ink, fontSize: 23, fontWeight: "900" }}>
          เปิดหน้าต่างสู่เขางู
        </Text>
        <Text style={{ color: C.muted, fontSize: 12, lineHeight: 19 }}>
          ลากภาพเพื่อหมุนภูเขา แล้วมองหาบึงกับสะพานไม้
        </Text>
      </View>

      <View
        {...responder.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel="ไดโอรามาจำลองอุทยานหินเขางูสามมิติ"
        accessibilityHint="ลากซ้ายหรือขวาเพื่อหมุน ลากขึ้นหรือลงเพื่อเปลี่ยนมุม"
        style={{
          width: "100%",
          height: 310,
          overflow: "hidden",
          borderRadius: 28,
          backgroundColor: "#CDEEF2",
          borderWidth: 2.5,
          borderColor: "#C18C58",
          shadowColor: "#8B6646",
          shadowOpacity: 0.14,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
          elevation: 3,
        }}
      >
        <SceneIllustration pose={pose} />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 7 }}>
        <SceneControl label="หมุนซ้าย" icon="arrow-undo" onPress={() => rotate(-1)} />
        <SceneControl label="หมุนขวา" icon="arrow-redo" onPress={() => rotate(1)} />
        <SceneControl label="เงยกล้อง" icon="chevron-up" onPress={() => rotate(-1, true)} />
        <SceneControl label="ก้มกล้อง" icon="chevron-down" onPress={() => rotate(1, true)} />
        <SceneControl label="ซูมออก" icon="remove" onPress={() => zoom(-0.08)} />
        <SceneControl label="ซูมเข้า" icon="add" onPress={() => zoom(0.08)} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", gap: 7, flexWrap: "wrap", flex: 1 }}>
          {["หินปูน", "บึงสีฟ้า", "สะพานไม้"].map((label, index) => (
            <View
              key={label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingHorizontal: 9,
                paddingVertical: 6,
                borderRadius: 99,
                backgroundColor: index === 0 ? "#FFF0D5" : index === 1 ? "#DDF6F2" : "#F8E5C6",
                borderWidth: 1,
                borderColor: "#E6C895",
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: index === 0 ? "#EBC47D" : index === 1 ? "#57C6C8" : "#B9824E" }} />
              <Text style={{ color: C.ink, fontSize: 10, fontWeight: "800" }}>{label}</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: C.muted, fontSize: 11, fontWeight: "800" }}>มุม {angle}°</Text>
      </View>

      <Card style={{ gap: 8, backgroundColor: "#FFF8E8" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <View style={{ width: 36, height: 36, borderRadius: 14, backgroundColor: "#FFEBC3", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="sparkles" size={18} color="#B97B37" />
          </View>
          <Text style={{ color: C.ink, fontSize: 14, fontWeight: "900" }}>แบบจำลองเพื่อเรียนรู้</Text>
        </View>
        <Text style={{ color: C.muted, fontSize: 12, lineHeight: 19 }}>
          ภูเขาหินปูน ผืนน้ำและสะพานในฉากนี้เป็นภาพจำลองสามมิติสำหรับสำรวจด้วยสายตา ไม่ได้สร้างจากข้อมูลสำรวจจริงและใช้แทนแผนที่นำทางในอุทยานไม่ได้
        </Text>
      </Card>
      <ActionButton label="เปิดแผนผังจุดสนใจ" icon="map-outline" onPress={() => router.push("/map")} />
      {data.settings.reduceMotion ? (
        <Text style={{ color: C.muted, fontSize: 10, textAlign: "center" }}>
          โหมดลดการเคลื่อนไหวเปิดอยู่ · ฉากจะเปลี่ยนเมื่อแตะหรือหมุนเท่านั้น
        </Text>
      ) : null}
    </Screen>
  );
}
