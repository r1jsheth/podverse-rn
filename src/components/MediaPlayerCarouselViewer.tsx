import { Alert, Dimensions, Linking, Pressable, StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { prefixClipLabel, readableClipTime } from '../lib/utility'
import { PV } from '../resources'
import { checkIfVideoFileType } from '../state/actions/playerVideo'
import { ActivityIndicator, FastImage, PressableWithOpacity, PVVideo, ScrollView,
  Text, TextTicker } from './'

type Props = {
  handlePressClipInfo: any
  navigation?: any
  width: number
}

const testIDPrefix = 'media_player_carousel_viewer'

const screenHeight = Dimensions.get('screen').width

export class MediaPlayerCarouselViewer extends React.PureComponent<Props> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  handleChapterLinkPress = (url: string) => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: translate('Cancel') },
      { text: translate('Yes'), onPress: () => Linking.openURL(url) }
    ])
  }

  render() {
    const { handlePressClipInfo, navigation, width } = this.props
    const { currentChapter, player, screenPlayer, screenReaderEnabled } = this.global
    const { isLoading } = screenPlayer
    
    // nowPlayingItem will be undefined when loading from a deep link
    let { nowPlayingItem } = player
    nowPlayingItem = nowPlayingItem || {}

    const { clipTitle, episodeImageUrl, episodeTitle, podcastImageUrl } = nowPlayingItem
    let { clipId, clipEndTime, clipStartTime } = nowPlayingItem
    let clipUrl = ''
    let imageUrl = episodeImageUrl || podcastImageUrl

    let finalClipTitle = clipTitle ? clipTitle : prefixClipLabel(episodeTitle)

    // If a clip is currently playing, then load the clip info.
    // Else if a chapter is currently playing, then override with the chapter info.
    const isOfficialChapter = currentChapter && !clipId
    if (isOfficialChapter) {
      clipId = currentChapter.id
      clipEndTime = currentChapter.endTime
      clipUrl = currentChapter.linkUrl
      clipStartTime = currentChapter.startTime
      finalClipTitle = currentChapter.title
      imageUrl = currentChapter.imageUrl || episodeImageUrl || podcastImageUrl
    }

    const imageStyles = [styles.image] as any
    if (clipUrl) {
      imageStyles.push(styles.imageBorder)
    }

    const textTopWrapperAccessibilityLabel = `${nowPlayingItem.episodeTitle}. ${nowPlayingItem.podcastTitle}`
    const useTo = true
    const clipAccessibilityLabel = `${finalClipTitle}, ${readableClipTime(clipStartTime, clipEndTime, useTo)}`
    const clipAccessibilityHint = isOfficialChapter
      ? translate('ARIA HINT - This is the now playing chapter info')
      : translate('ARIA HINT - This is the now playing clip info')

    const episodeTitleComponent = (
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={styles.episodeTitle}
        testID={`${testIDPrefix}_episode_title`}>
        {nowPlayingItem.episodeTitle}
      </Text>
    )

    const clipTitleComponent = (
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={styles.clipTitle}
        testID={`${testIDPrefix}_clip_title`}>
        {finalClipTitle}
      </Text>
    )

    const outerWrapperStyle = screenReaderEnabled
      ? [styles.outerWrapper, { paddingBottom: 10, paddingHorizontal: 10 }, { width }]
      : [styles.outerWrapper, { padding: 10 }, { width }]

    const imageWrapperStyle = screenHeight < PV.Dimensions.smallScreen.height
      ? [styles.carouselImageWrapper, { width: width * 0.9 }, { height: '50%' }]
      : [styles.carouselImageWrapper, { width: width * 0.9 }]

    return (
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={outerWrapperStyle}>
        <RNView
          accessible
          accessibilityHint={translate('ARIA HINT - This is the now playing episode')}
          accessibilityLabel={textTopWrapperAccessibilityLabel}
          style={styles.carouselTextTopWrapper}>
          {isLoading ? (
            <ActivityIndicator fillSpace testID={testIDPrefix} />
          ) : (
            !!nowPlayingItem && (
              <RNView style={styles.episodeTitleWrapper}>
                {
                  !screenReaderEnabled ? (
                    <TextTicker
                      allowFontScaling={false}
                      bounce
                      importantForAccessibility='no-hide-descendants'
                      loop
                      textLength={nowPlayingItem?.episodeTitle?.length}>
                      {episodeTitleComponent}
                    </TextTicker>
                  ) : episodeTitleComponent
                }
                <Text
                  allowFontScaling={false}
                  isSecondary
                  numberOfLines={1}
                  style={styles.podcastTitle}
                  testID='media_player_carousel_viewer_podcast_title'>
                  {nowPlayingItem.podcastTitle}
                </Text>
              </RNView>
            )
          )}
        </RNView>
        <RNView style={imageWrapperStyle}>
          {
            checkIfVideoFileType(nowPlayingItem) && (
              <PVVideo navigation={navigation} />
            )
          }
          {
            !checkIfVideoFileType(nowPlayingItem) && (
              <PressableWithOpacity
                accessible={false}
                activeOpacity={1}
                {...(clipUrl ? { onPress: () => this.handleChapterLinkPress(clipUrl) } : {})}
                style={styles.imageContainer}>
                <FastImage key={imageUrl} source={imageUrl} styles={imageStyles} />
              </PressableWithOpacity>
            )
          }
        </RNView>
        {!!clipId && (
          <RNView style={styles.carouselChapterWrapper}>
            <Pressable
              accessibilityHint={clipAccessibilityHint}
              accessibilityLabel={clipAccessibilityLabel}
              onPress={handlePressClipInfo}>
              <RNView style={styles.clipWrapper}>
                {
                  !screenReaderEnabled ? (
                    <TextTicker
                      allowFontScaling={false}
                      bounce
                      importantForAccessibility='no-hide-descendants'
                      loop
                      styles={styles.clipTitle}
                      textLength={finalClipTitle?.length}>
                      {clipTitleComponent}
                    </TextTicker>
                  ) : clipTitleComponent
                }
                <Text allowFontScaling={false} style={styles.clipTime} testID='media_player_carousel_viewer_time'>
                  {readableClipTime(clipStartTime, clipEndTime)}
                </Text>
              </RNView>
            </Pressable>
          </RNView>
        )}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  outerWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  carouselTextTopWrapper: {
    justifyContent: 'flex-end',
    marginBottom: 12
  },
  carouselImageWrapper: {
    alignItems: 'center',
    height: '65%'
  },
  carouselChapterWrapper: {},
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  clipWrapper: {
    alignItems: 'center',
    marginTop: 12
  },
  clipTime: {
    color: PV.Colors.skyLight,
    fontSize: PV.Fonts.sizes.sm,
    minHeight: PV.Player.carouselTextSubBottomWrapper.height,
    marginTop: PV.Player.carouselTextSubBottomWrapper.marginTop,
    textAlign: 'center'
  },
  clipTitle: {
    fontSize: PV.Fonts.sizes.xxl,
    paddingBottom: 2,
    color: PV.Colors.white
  },
  episodeTitleWrapper: {
    alignItems: 'center'
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.xxl
  },
  imageBorder: {
    borderColor: PV.Colors.skyDark,
    borderWidth: 5
  },
  podcastTitle: {
    color: PV.Colors.skyDark,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold,
    marginTop: 2,
    textAlign: 'center'
  }
})
