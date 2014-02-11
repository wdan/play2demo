package models

import scala.collection.mutable._
import scala.io.Source

import play.Play
import play.api.libs.json._

class Graph(var nodes: List[Node], var edges: List[Edge]){

  def this(dataType: String) = {
    this(Graph.initNodes(dataType), Graph.initEdges(dataType))
  }

  def setData(dataType: String) {
    this.nodes = Graph.initNodes(dataType)
    this.edges = Graph.initEdges(dataType)
  }

  def formatedEdges(
    nodes: List[Int] = null,
    highlight: List[Int] = null
  ): JsArray = {
     var jsonEdges = Json.arr()
     var cnt = 0
     for (edge <- this.edges) {
      if (
        nodes == null
        || (nodes.exists(_ == edge.source) && nodes.exists(_ == edge.target))
      ) {
        var jsonEdge = edge.toDict()
        if (
          highlight != null
          && (highlight.exists(_ == edge.source) || highlight.exists(_ == edge.target))
        ) {
          jsonEdge = jsonEdge ++ Json.obj("highlight" -> 1)
        } else {
          jsonEdge = jsonEdge ++ Json.obj("highlight" -> 0)
        }
        jsonEdges = jsonEdges append jsonEdge
        cnt += 1
      }
    }
    return jsonEdges
  }

  def formatedNodes(highlight: List[Int] = null): JsArray = {
    var jsonNodes = Json.arr()
    var secondNodes: List[Int] = null
    if (highlight != null) {
      secondNodes = this.findSecondImportantNodes(highlight)
    }
    for (node <- this.nodes) {
      var jsonNode = node.toDict()
      if (highlight == null) {
        jsonNode = jsonNode ++ Json.obj("highlight" -> 0)
      } else if (highlight.exists(_ == node.name)) {
        jsonNode = jsonNode ++ Json.obj("highlight" -> 3)
      } else if (secondNodes.exists(_ == node.name)) {
        jsonNode = jsonNode ++ Json.obj("highlight" -> 2)
      } else {
        jsonNode = jsonNode ++ Json.obj("highlight" -> 1)
      }
      jsonNodes = jsonNodes append jsonNode
    }
    return jsonNodes
  }

  def formatedCentricNodes(
    center: Int,
    maxSteps: Int = Int.MaxValue
  ): Tuple2[JsArray, List[Int]] = {
    var jsonNodes = Json.arr()
    val nodesList = ListBuffer[Int]()
    val tuple = this.getCenterSteps(center, maxSteps)
    val steps = tuple._1
    val subtreeNum = tuple._2
    val children = tuple._3
    val degree = this.getDegree()
    for (i <- 0 until this.nodes.length) {
      if (steps(i) >= 0 && steps(i) <= maxSteps) {
        var jsonNode = this.nodes(i).toDict()
        nodesList.append(this.nodes(i).name)
        jsonNode = jsonNode ++ Json.obj("step" -> steps(i))
        jsonNode = jsonNode ++ Json.obj("degree" -> degree(i))
        jsonNode = jsonNode ++ Json.obj("subtree-num" -> (subtreeNum(i) + 1))
        jsonNode = jsonNode ++ Json.obj("children" -> children.get(i))
        jsonNode = jsonNode ++ Json.obj("highlight" -> 0)
        jsonNodes = jsonNodes append jsonNode
      }
    }
    return (jsonNodes, nodesList.toList)
  }

  private def findSecondImportantNodes(highlight: List[Int]): List[Int] = {
    val nodes = new HashSet[Int]()
    for (edge <- this.edges) {
      if (!(highlight.exists(_ == edge.source) && highlight.exists(_ == edge.target))) {
        if (highlight.exists(_ == edge.source)) {
          nodes += edge.source
        }
        if (highlight.exists(_ == edge.target)) {
          nodes += edge.target
        }
      }
    }
    return nodes.toList
  }

  private def getNodesDegreeDict(): HashMap[Int, Int] = {
    val nodesDict = new HashMap[Int, Int]()
    for (edge <- this.edges) {
      if (nodesDict.contains(edge.source)) {
        nodesDict(edge.source) += 1
      } else {
        nodesDict += (edge.source -> 1)
      }
      if (nodesDict.contains(edge.target)) {
        nodesDict(edge.target) += 1
      } else {
        nodesDict += (edge.target -> 1)
      }
    }
    return nodesDict
  }

  def getDegree(): List[Int] = {
    val nodesDict = this.getNodesDegreeDict()
    val degree = ListBuffer[Int]()
    for (node <- this.nodes) {
      if (nodesDict.contains(node.name)){
        degree.append(nodesDict.getOrElse(node.name, 0))
      } else {
        degree.append(0)
      }
    }
    return degree.toList
  }

  def getNodesByDegree(k: Int): List[Int] = {
    val nodesDict:HashMap[Int, Int] = this.getNodesDegreeDict()
    var nodesDegreeList = nodesDict.toList
    nodesDegreeList = nodesDegreeList.sortBy(e => e._2).reverse
    def f(x: Int, degree: Int) = if (degree >= k) Some(x) else None
    return nodesDegreeList.flatMap(t => f(t._1, t._2))
  }

  private def buildAdjacencyMatrix(): Array[Array[Int]] = {
    val nodesLen = this.nodes.length
    val matrix = Array.ofDim[Int](nodesLen, nodesLen)
    for (edge <- this.edges) {
      matrix(edge.source)(edge.target) = 1
      matrix(edge.target)(edge.source) = 1
    }
    return matrix
  }

  private def getCenterSteps(
    center: Int,
    maxSteps:Int
  ): Tuple3[List[Int], List[Int], HashMap[Int, List[Int]]] = {
    val steps: ListBuffer[Int] = new ListBuffer()
    val matrix = this.buildAdjacencyMatrix()
    val queue = new Queue[Tuple2[Int, Int]]()
    queue += Tuple2(center, 0)
    val used = new HashMap[Int, Int]()
    used += (center -> 0)
    val children = new HashMap[Int, ListBuffer[Int]]()
    while (queue.size != 0) {
      val (now, step) = queue.dequeue()
      if (step <= maxSteps) {
        children += (now -> new ListBuffer[Int]())
        for (i <- 0 until matrix(now).length) {
          if (matrix(now)(i) > 0 && (!used.contains(i))) {
            queue += Tuple2(i, step + 1)
            used += (i -> (step + 1))
            val tList = children.getOrElse(now, new ListBuffer[Int]())
            tList.append(i)
          }
        }
      }
    }
    for (node <- this.nodes) {
      if (used.contains(node.name)) {
        steps.append(used.getOrElse(node.name, -1))
      } else {
        children += (node.name -> new ListBuffer[Int]())
        steps.append(-1)
      }
    }
    val childrenList = children.map {case (k, v) => (k, v.toList)}
    val subtreeNum = this.calSubtreeNum(childrenList, center, maxSteps)
    return (steps.toList, subtreeNum, childrenList)
  }

  private def calSubtreeNum(
    children: HashMap[Int, List[Int]],
    center: Int,
    maxSteps: Int
  ): List[Int] = {
    val subtreeNum = new HashMap[Int, Int]()
    val res = new ListBuffer[Int]()
    this.calChildrenNode(subtreeNum, children, center, 0, maxSteps)
    for (node <- this.nodes) {
      if (subtreeNum.contains(node.name)) {
        res.append(subtreeNum.getOrElse(node.name, 0))
      } else {
        res.append(0)
      }
    }
    return res.toList
  }

  private def calChildrenNode(
    subtreeNum: HashMap[Int, Int],
    children: HashMap[Int, List[Int]],
    center: Int,
    now: Int,
    maxSteps: Int
  ): Int = {
    if (now > maxSteps) {
      return 0
    }
    val tList = children.getOrElse(center, List[Int]())
    var cnt = tList.length
    for (i <- tList) {
      cnt += this.calChildrenNode(subtreeNum, children, i, now+1, maxSteps)
    }
    subtreeNum += (center -> cnt)
    return cnt
  }
}

object Graph{

  def initEdges(dataType: String): List[Edge] = {
    val edges: ListBuffer[Edge] = new ListBuffer()
    val data = getEdgeData(dataType)
    for ((x, y) <- data) {
      edges += Edge(x, y)
    }
    return edges.toList
  }

  def initNodes(dataType: String): List[Node] = {
    val nodes: ListBuffer[Node] = new ListBuffer()
    val data = getNodeData(dataType)
    for (e <- data) {
      nodes += Node(e)
    }
    return nodes.toList
  }

  def getEdgeData(dataType: String): List[Tuple2[Int, Int]] = {
    val edgeData = new ListBuffer[Tuple2[Int, Int]]
    val uri: String = (
      if (dataType == "facebook") {
        "/public/data/facebook.txt"
      } else {
        "/public/data/edges.csv"
      }
    )
    val file = Graph.getClass().getResourceAsStream(uri)
    val src = Source.fromInputStream(file)
    for (line <- src.getLines()) {
      val mark: String = if (dataType == "facebook") " " else ","
      val tArray: Array[String] = line.split(mark)
      if (tArray(0).toInt != tArray(1).toInt) {
        edgeData += Tuple2(tArray(0).toInt, tArray(1).toInt)
      }
    }
    return edgeData.toList
  }

  def getNodeData(dataType: String): List[Int] = {
    val nodeData = new ListBuffer[Int]
    if (dataType == "facebook") {
      for (i <- 0 until 5000) {
        nodeData.append(i)
      }
    } else {
      val uri: String = "/public/data/nodes.csv"
      val file = Graph.getClass().getResourceAsStream(uri)
      val src = Source.fromInputStream(file)
      for (line <- src.getLines()) {
        nodeData += line.toInt
      }
    }
    return nodeData.toList
  }

  def starNode(nodeNum: Int): List[Int] = {
    return List(nodeNum)
  }
}
