import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomCtaBar } from '../components/ui';
import { ONBOARDED, setSetting } from '../db/settings';
import { colors, rounded, spacing, type as t } from '../theme';

const STEPS = 3;

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const finish = () => {
    setSetting(ONBOARDED, '1');
    router.replace('/');
  };

  const next = () => (step === STEPS - 1 ? finish() : setStep((v) => v + 1));

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* 건너뛰기를 두지 않는다 — 3화면뿐이고 2단계는 반드시 한 번 봐야 한다 (design.md §2.0) */}
      <View style={s.header}>
        <View style={s.dots}>
          {Array.from({ length: STEPS }, (_, i) => (
            <View key={i} style={[s.dot, i === step && s.dotOn]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {step === 0 ? <ValueProp /> : null}
        {step === 1 ? <LocalDataNotice /> : null}
        {step === 2 ? <LocationNotice /> : null}
      </ScrollView>

      <BottomCtaBar label={['다음', '알겠어요', '시작하기'][step]} onPress={next} />
    </View>
  );
}

function ValueProp() {
  return (
    <>
      <Text style={s.title}>여행 하나를,{'\n'}처음부터 끝까지</Text>
      <Text style={s.body}>계획하고, 다니면서 쓰고, 끝나면 정리까지</Text>
      {/* 클레이 일러스트 자리 (design-system §자산 로드맵 4번) */}
      <View style={s.figure} />
      <View style={s.points}>
        <Point title="일차별 일정 보드" body="장소를 담으면 사이 거리가 바로 보입니다" />
        <Point title="가계부 · 체크리스트" body="여행 하나에 필요한 것들이 같이 붙어 있어요" />
        <Point title="계정 없이" body="가입도, 로그인도 없습니다" />
      </View>
    </>
  );
}

function LocalDataNotice() {
  return (
    <>
      <Text style={s.title}>로그인 없이 바로 씁니다</Text>
      <View style={s.callout}>
        <Text style={s.calloutBody}>
          여행 데이터는 이 기기에만 저장됩니다.{'\n'}계정도, 서버도 없습니다.
        </Text>
      </View>
      <View style={[s.callout, s.calloutWarn]}>
        <Text style={s.calloutWarnBody}>앱을 삭제하면 여행 기록도 함께 사라집니다.</Text>
      </View>
      <Text style={s.body}>
        여행 설정의 <Text style={s.bodyStrong}>JSON 내보내기</Text>로 백업할 수 있어요.
      </Text>
      <View style={s.figure} />
    </>
  );
}

function LocationNotice() {
  return (
    <>
      <Text style={s.title}>주변 장소를 찾을 때{'\n'}위치를 물어볼게요</Text>
      <View style={s.callout}>
        <Text style={s.calloutBody}>
          위치는 <Text style={s.bodyStrong}>장소 검색과 지도 표시</Text>에만 씁니다.{'\n'}
          이동 경로를 기록하거나 저장하지 않습니다.
        </Text>
      </View>
      <Text style={s.body}>
        지금은 묻지 않습니다. 장소를 처음 검색할 때 기기가 물어봐요.
      </Text>
      <View style={s.figure} />
    </>
  );
}

function Point({ title, body }: { title: string; body: string }) {
  return (
    <View style={s.point}>
      <Text style={s.pointTitle}>{title}</Text>
      <Text style={s.pointBody}>{body}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: spacing.gutter, minHeight: 56, justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.hairline },
  dotOn: { width: 18, backgroundColor: colors.primary },

  content: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl, gap: spacing.sm },
  title: { ...t.displayLg, color: colors.ink, paddingTop: spacing.md },
  body: { ...t.bodyMd, color: colors.muted },
  bodyStrong: { ...t.bodyMd, color: colors.ink },

  figure: {
    height: 160,
    borderRadius: rounded.xl,
    backgroundColor: colors.surfaceCard,
    marginTop: spacing.xs,
  },

  points: { gap: spacing.md, paddingTop: spacing.xs },
  point: { gap: 2 },
  pointTitle: { ...t.titleMd, color: colors.ink },
  pointBody: { ...t.bodySm, color: colors.muted },

  callout: {
    borderRadius: rounded.lg,
    backgroundColor: colors.surfaceCard,
    padding: spacing.md,
  },
  calloutBody: { ...t.bodyMd, color: colors.ink },
  calloutWarn: { backgroundColor: colors.brandPeach },
  calloutWarnBody: { ...t.titleMd, color: colors.ink },
});
