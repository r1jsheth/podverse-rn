import AsyncStorage from '@react-native-community/async-storage'
import { FlatList } from 'react-native-gesture-handler'
import RNSecureKeyStore from 'react-native-secure-key-store'
import React from 'reactn'
import { ActivityIndicator, Divider, PodcastTableCell, TableSectionSelectors, View } from '../components'
import { PV } from '../resources'
import { getPodcasts } from '../services/podcast'
import { getAuthUserInfo } from '../state/actions/auth'
import { getSubscribedPodcasts } from '../state/actions/podcasts'

type Props = {
  navigation?: any
}

type State = {
  isLoading: boolean
  podcasts: any[]
  queryFrom: string
  querySort: string
  selectedCategory?: string
}

export class PodcastsScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Podcasts'
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      isLoading: true,
      podcasts: [],
      queryFrom: _subscribedKey,
      querySort: _alphabeticalKey
    }
  }

  async componentDidMount() {
    const { navigation } = this.props

    try {
      const appHasLaunched = await AsyncStorage.getItem(PV.Keys.APP_HAS_LAUNCHED)
      if (!appHasLaunched) {
        AsyncStorage.setItem(PV.Keys.APP_HAS_LAUNCHED, 'true')
        navigation.navigate(PV.RouteNames.Onboarding)
      } else {
        const userToken = await RNSecureKeyStore.get('BEARER_TOKEN')
        if (userToken) {
          await getAuthUserInfo()
        }
      }
    } catch (error) {
      console.log(error.message)
    }

    this.setState({ isLoading: false })
  }

  selectLeftItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    const { settings } = this.global
    const { nsfwMode } = settings

    this.setState({
      isLoading: true,
      queryFrom: selectedKey
    })

    let podcasts = []
    const newState = {
      isLoading: false,
      selectedCategory: ''
    } as any
    if (selectedKey === _subscribedKey) {
      const { session } = this.global
      const { subscribedPodcastIds } = session.userInfo
      newState.podcasts = await getSubscribedPodcasts(subscribedPodcastIds || [])
    } else if (selectedKey === _allPodcastsKey) {
      const querySort = 'alphabetical'
      podcasts = await getPodcasts({ sort: querySort }, nsfwMode)
      newState.podcasts = podcasts[0]
      newState.querySort = querySort
    } else if (selectedKey === _categoryKey) {
      const querySort = 'alphabetical'
      podcasts = await getPodcasts({
        categories: selectedKey,
        sort: querySort
      }, nsfwMode)
      newState.querySort = querySort
      newState.selectedCategory = selectedKey
    }

    this.setState(newState)
  }

  selectRightItem = async (selectedKey: string) => {
    if (!selectedKey) return

    const { settings } = this.global
    const { nsfwMode } = settings
    const { queryFrom, selectedCategory } = this.state

    this.setState({
      isLoading: true,
      querySort: selectedKey
    })

    let podcasts = []
    let newState = { isLoading: false }
    if (queryFrom === _subscribedKey) {
      const { session } = this.global
      const { subscribedPodcastIds } = session.userInfo
      newState.podcasts = await getSubscribedPodcasts(subscribedPodcastIds || [])
    } else if (queryFrom === _allPodcastsKey) {
      podcasts = await getPodcasts({ sort: selectedKey }, nsfwMode)
      newState.podcasts = podcasts[0]
    } else if (queryFrom === _categoryKey) {
      podcasts = await getPodcasts({
        categories: selectedCategory,
        sort: selectedKey
      }, nsfwMode)
      newState.podcasts = podcasts[0]
    }

    this.setState(newState)
  }

  _renderPodcastItem = ({ item }) => {
    const downloadCount = item.episodes ? item.episodes.length : 0

    return (
      <PodcastTableCell
        key={item.id}
        autoDownloadOn={true}
        downloadCount={downloadCount}
        handleNavigationPress={() => this.props.navigation.navigate(
          PV.RouteNames.PodcastScreen, { podcast: item }
        )}
        lastEpisodePubDate={item.lastEpisodePubDate}
        podcastImageUrl={item.imageUrl}
        podcastTitle={item.title} />
    )
  }

  render() {
    const { navigation } = this.props
    const { queryFrom, isLoading, querySort } = this.state
    const { globalTheme, session, showPlayer, subscribedPodcasts = [] } = this.global
    const { userInfo = {}, isLoggedIn = false } = session
    const { name = '' } = userInfo

    let podcasts = []
    if (queryFrom === _subscribedKey) {
      podcasts = subscribedPodcasts
    } else if (queryFrom === _allPodcastsKey) {
      podcasts = this.state.podcasts
    }

    return (
      <View style={styles.view}>
        <TableSectionSelectors
          handleSelectLeftItem={this.selectLeftItem}
          handleSelectRightItem={this.selectRightItem}
          leftItems={leftItems}
          rightItems={queryFrom === _subscribedKey ? [] : rightItems}
          selectedLeftItemKey={queryFrom}
          selectedRightItemKey={querySort} />
        {
          isLoading &&
            <ActivityIndicator />
        }
        {
          !isLoading &&
            <FlatList
              data={podcasts}
              ItemSeparatorComponent={() => <Divider noMargin={true} />}
              keyExtractor={(item) => item.id}
              renderItem={this._renderPodcastItem}
              style={{ flex: 1 }} />
        }
      </View>
    )
  }
}

const styles = {
  view: {
    flex: 1
  }
}

const _subscribedKey = 'subscribed'
const _allPodcastsKey = 'allPodcasts'
const _categoryKey = 'category'
const _alphabeticalKey = 'alphabetical'
const _mostRecentKey = 'most-recent'
const _topPastDay = 'top-past-day'
const _topPastWeek = 'top-past-week'
const _topPastMonth = 'top-past-month'
const _topPastYear = 'top-past-year'

const leftItems = [
  {
    label: 'Subscribed',
    value: _subscribedKey
  },
  {
    label: 'All Podcasts',
    value: _allPodcastsKey
  },
  {
    label: 'Category',
    value: _categoryKey
  }
]

const rightItems = [
  {
    label: 'alphabetical',
    value: _alphabeticalKey
  },
  {
    label: 'most recent',
    value: _mostRecentKey
  },
  {
    label: 'top - past day',
    value: _topPastDay
  },
  {
    label: 'top - past week',
    value: _topPastWeek
  },
  {
    label: 'top - past month',
    value: _topPastMonth
  },
  {
    label: 'top - past year',
    value: _topPastYear
  }
]
