export interface PoolDetails {
    alerts: any[]
    alertsSilenceURL: string
    autoCompactionSettings: AutoCompactionSettings
    buckets: Buckets
    controllers: Controllers
    counters: Counters
    fastWarmupSettings: FastWarmupSettings
    maxBucketCount: number
    name: string
    nodeStatusesUri: string
    nodes: Node[]
    rebalanceProgressUri: string
    rebalanceStatus: string
    remoteClusters: RemoteClusters
    serverGroupsUri: string
    stopRebalanceUri: string
    storageTotals: StorageTotals
    tasks: Tasks
    visualSettingsUri: string
  }
  
  interface AutoCompactionSettings {
    databaseFragmentationThreshold: DatabaseFragmentationThreshold
    parallelDBAndViewCompaction: boolean
    viewFragmentationThreshold: ViewFragmentationThreshold
  }
  
  interface DatabaseFragmentationThreshold {
    percentage: number
    size: string
  }
  
  interface ViewFragmentationThreshold {
    percentage: number
    size: string
  }
  
  interface Buckets {
    terseBucketsBase: string
    terseStreamingBucketsBase: string
    uri: string
  }
  
  interface Controllers {
    addNode: AddNode
    clusterLogsCollection: ClusterLogsCollection
    ejectNode: EjectNode
    failOver: FailOver
    reAddNode: ReAddNode
    reFailOver: ReFailOver
    rebalance: Rebalance
    replication: Replication
    setAutoCompaction: SetAutoCompaction
    setFastWarmup: SetFastWarmup
    setRecoveryType: SetRecoveryType
    startGracefulFailover: StartGracefulFailover
  }
  
  interface AddNode {
    uri: string
  }
  
  interface ClusterLogsCollection {
    cancelURI: string
    startURI: string
  }
  
  interface EjectNode {
    uri: string
  }
  
  interface FailOver {
    uri: string
  }
  
  interface ReAddNode {
    uri: string
  }
  
  interface ReFailOver {
    uri: string
  }
  
  interface Rebalance {
    uri: string
  }
  
  interface Replication {
    createURI: string
    validateURI: string
  }
  
  interface SetAutoCompaction {
    uri: string
    validateURI: string
  }
  
  interface SetFastWarmup {
    uri: string
    validateURI: string
  }
  
  interface SetRecoveryType {
    uri: string
  }
  
  interface StartGracefulFailover {
    uri: string
  }
  
  interface Counters {}
  
  interface FastWarmupSettings {
    fastWarmupEnabled: boolean
    minItemsThreshold: number
    minMemoryThreshold: number
  }
  
  interface Node {
    clusterCompatibility: number
    clusterMembership: string
    couchApiBase: string
    hostname: string
    interestingStats: InterestingStats
    mcdMemoryAllocated: number
    mcdMemoryReserved: number
    memoryFree: number
    memoryTotal: number
    os: string
    otpCookie: string
    otpNode: string
    ports: Ports
    recoveryType: string
    status: string
    systemStats: SystemStats
    thisNode: boolean
    uptime: string
    version: string
  }
  
  interface InterestingStats {
    cmd_get: number
    couch_docs_actual_disk_size: number
    couch_docs_data_size: number
    couch_views_actual_disk_size: number
    couch_views_data_size: number
    curr_items: number
    curr_items_tot: number
    ep_bg_fetched: number
    get_hits: number
    mem_used: number
    ops: number
    vb_replica_curr_items: number
  }
  
  interface Ports {
    direct: number
    httpsCAPI: number
    httpsMgmt: number
    proxy: number
    sslProxy: number
  }
  
  interface SystemStats {
    cpu_utilization_rate: number
    mem_free: number
    mem_total: number
    swap_total: number
    swap_used: number
  }
  
  interface RemoteClusters {
    uri: string
    validateURI: string
  }
  
  interface StorageTotals {
    hdd: Hdd
    ram: Ram
  }
  
  interface Hdd {
    free: number
    quotaTotal: number
    total: number
    used: number
    usedByData: number
  }
  
  interface Ram {
    quotaTotal: number
    quotaTotalPerNode: number
    quotaUsed: number
    quotaUsedPerNode: number
    total: number
    used: number
    usedByData: number
  }
  
  interface Tasks {
    uri: string
  }
  